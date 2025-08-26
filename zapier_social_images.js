/*
 Main script: reads Supabase rows, generates square images, uploads to R2, updates DB,
 and optionally posts to Instagram (single or carousel).
*/
const { getSupabase } = require('./supabase');
const { config, assertCoreEnv } = require('./config');
const { uploadBufferToR2, buildObjectKey, randomId } = require('./r2');
const { fetchAndPrepareSquare } = require('./image');
const pLimitImport = require('p-limit');
const pLimit = typeof pLimitImport === 'function' ? pLimitImport : pLimitImport.default;
const { isInstagramConfigured, createImageContainer, createCarouselContainer, publishMedia } = require('./instagram');
const { postToZapier, isZapierConfigured } = require('./zapier');
const { postToMake, isMakeConfigured } = require('./make');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const CSV_ONLY = process.argv.includes('--csv-only');
function getArgValue(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return fallback;
}
const CSV_OUT = getArgValue('--csv-out', 'out/posts.csv');

function nowIso() {
  return new Date().toISOString();
}

function sanitizeSlug(text) {
  if (!text) return 'item';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

function extractImageUrls(developmentImages) {
  if (!developmentImages) return [];
  try {
    // Supabase may return JSON already parsed; if it's a string, parse it
    const value = typeof developmentImages === 'string' ? JSON.parse(developmentImages) : developmentImages;
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            return item.url || item.src || item.image_url || item.href || null;
          }
          return null;
        })
        .filter(Boolean);
    }
    if (value && typeof value === 'object') {
      // Single object form
      const maybe = value.url || value.src || value.image_url || value.href;
      return maybe ? [maybe] : [];
    }
    return [];
  } catch (_e) {
    return [];
  }
}

async function fetchCandidates({ ignoreSchedule = false } = {}) {
  const supabase = getSupabase();
  const now = nowIso();
  // Note: .or uses URL encoding; supabase-js handles it internally.
  let query = supabase
    .from('social_media_data')
    .select('*')
    .not('caption_1', 'is', null)
    .order('created_at', { ascending: true })
    .limit(50);

  if (!ignoreSchedule) {
    // Skip items scheduled in the future (only process where scheduled_at is null or <= now)
    query = query.or(`scheduled_at.is.null,scheduled_at.lte.${now}`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).filter((row) => {
    const urls = extractImageUrls(row.development_images);
    return Array.isArray(urls) && urls.length > 0;
  });
}

function buildR2KeyBase(row) {
  const slug = sanitizeSlug(row.development_slug || row.development_name || row.title || row.unit_number || randomId(4));
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return buildObjectKey([config.r2UploadPrefix, slug, ts]);
}

async function processRow(row) {
  const supabase = getSupabase();
  const sourceUrls = extractImageUrls(row.development_images).slice(0, config.maxImagesPerPost);
  if (sourceUrls.length === 0) {
    return { row, skipped: true, reason: 'No development_images URLs' };
  }

  const baseKey = buildR2KeyBase(row);
  const limiter = pLimit(3);

  const prepared = await Promise.all(
    sourceUrls.map((url, idx) =>
      limiter(async () => {
        const { buffer, contentType, extension } = await fetchAndPrepareSquare(url);
        const key = buildObjectKey([baseKey, `image_${idx + 1}.${extension}`]);
        const publicUrl = await uploadBufferToR2(key, buffer, contentType);
        return { key, publicUrl };
      })
    )
  );

  const resizedUrls = prepared.map((p) => p.publicUrl);

  // Persist resized URLs to social_images_1
  const updatePayload = { social_images_1: resizedUrls, updated_at: nowIso() };

  let updateQuery = supabase.from('social_media_data').update(updatePayload);

  const addFilter = (q, col, val) => {
    if (val === null || val === undefined) return q.is(col, null);
    return q.eq(col, val);
  };

  if (row.id) {
    updateQuery = updateQuery.eq('id', row.id);
  } else {
    updateQuery = addFilter(updateQuery, 'development_id', row.development_id);
    updateQuery = addFilter(updateQuery, 'unit_number', row.unit_number);
    updateQuery = addFilter(updateQuery, 'title', row.title);
  }

  const { data: updated, error: updateErr } = await updateQuery.select('*');
  if (updateErr) throw updateErr;

  return { row: updated && updated[0] ? updated[0] : row, resizedUrls };
}

async function publishToInstagramIfConfigured(row, resizedUrls) {
  // Prefer Make.com over Zapier when available
  if (isMakeConfigured()) {
    if (DRY_RUN) {
      return { published: false, reason: 'Dry run (Make configured)' };
    }
    const payload = {
      source: 'social_auto',
      type: resizedUrls.length > 1 ? 'carousel' : 'single',
      caption: row.caption_1 || '',
      images: resizedUrls,
      meta: {
        development_id: row.development_id,
        unit_number: row.unit_number,
        title: row.title,
        development_name: row.development_name,
        development_slug: row.development_slug,
      },
    };
    await postToMake(payload);
    return { published: true, via: 'make' };
  }

  // If Zapier is configured, prefer sending to Zapier and let Zap handle Meta posting
  if (isZapierConfigured()) {
    if (DRY_RUN) {
      return { published: false, reason: 'Dry run (Zapier configured)' };
    }
    const payload = {
      source: 'social_auto',
      type: resizedUrls.length > 1 ? 'carousel' : 'single',
      caption: row.caption_1 || '',
      images: resizedUrls,
      meta: {
        development_id: row.development_id,
        unit_number: row.unit_number,
        title: row.title,
        development_name: row.development_name,
        development_slug: row.development_slug,
      },
    };
    await postToZapier(payload);
    return { published: true, via: 'zapier' };
  }

  if (!isInstagramConfigured()) {
    return { published: false, reason: 'Instagram not configured' };
  }
  if (DRY_RUN) {
    return { published: false, reason: 'Dry run' };
  }

  const caption = row.caption_1 || '';

  if (resizedUrls.length === 1) {
    const { id: creationId } = await createImageContainer({
      igUserId: config.igUserId,
      imageUrl: resizedUrls[0],
      caption,
    });
    const publishRes = await publishMedia({ igUserId: config.igUserId, creationId });
    return { published: true, type: 'single', mediaId: publishRes.id };
  }

  // Carousel flow
  const children = [];
  for (const url of resizedUrls) {
    const { id } = await createImageContainer({
      igUserId: config.igUserId,
      imageUrl: url,
      isCarouselItem: true,
    });
    children.push(id);
  }
  const { id: carouselCreationId } = await createCarouselContainer({
    igUserId: config.igUserId,
    childrenIds: children,
    caption,
  });
  const publishRes = await publishMedia({ igUserId: config.igUserId, creationId: carouselCreationId });
  return { published: true, type: 'carousel', mediaId: publishRes.id };
}

async function main() {
  assertCoreEnv();
  const supabase = getSupabase();

  const rows = await fetchCandidates({ ignoreSchedule: CSV_ONLY });
  if (rows.length === 0) {
    console.log('No candidates to process.');
    return;
  }

  console.log(`Found ${rows.length} candidate row(s).`);

  const csvRows = [];
  const imageColumnsCount = Math.max(1, Number(config.maxImagesPerPost || 10));
  const csvHeader = [
    'id',
    'development_id',
    'unit_number',
    'title',
    'development_name',
    'development_slug',
    'caption_1',
    ...Array.from({ length: imageColumnsCount }, (_, i) => `image_${i + 1}`),
    'num_images',
    'updated_at',
  ];

  function escapeCsv(val) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (/[",\n]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  for (const row of rows) {
    try {
      // Skip if already processed (has social_images_1)
      if (row.social_images_1 && Array.isArray(row.social_images_1) && row.social_images_1.length > 0) {
        console.log(`Skipping row (already has social_images_1):`, row.title || row.development_name || row.unit_number || row.development_id);
        if (CSV_ONLY) {
          const urls = Array.isArray(row.social_images_1) ? row.social_images_1 : [];
          const imageCells = Array.from({ length: imageColumnsCount }, (_, i) => urls[i] || '');
          csvRows.push([
            row.id || '',
            row.development_id || '',
            row.unit_number || '',
            row.title || '',
            row.development_name || '',
            row.development_slug || '',
            row.caption_1 || '',
            ...imageCells,
            urls.length,
            row.updated_at || '',
          ]);
        }
        continue;
      }
      const result = await processRow(row);
      if (result.skipped) {
        console.log(`Skipped row: ${result.reason}`);
        continue;
      }
      console.log(`Uploaded ${result.resizedUrls.length} image(s) to R2.`);
      // Add to CSV
      const imageCells = Array.from({ length: imageColumnsCount }, (_, i) => result.resizedUrls[i] || '');
      csvRows.push([
        result.row.id || '',
        result.row.development_id || '',
        result.row.unit_number || '',
        result.row.title || '',
        result.row.development_name || '',
        result.row.development_slug || '',
        result.row.caption_1 || '',
        ...imageCells,
        result.resizedUrls.length,
        result.row.updated_at || '',
      ]);

      if (!CSV_ONLY) {
        const publishRes = await publishToInstagramIfConfigured(result.row, result.resizedUrls);
        if (publishRes.published) {
          console.log(`Published to Instagram (${publishRes.type || publishRes.via})`);
        } else {
          console.log(`Did not publish to Instagram → ${publishRes.reason}`);
        }
      }
    } catch (err) {
      console.error('Error processing row:', err?.response?.data || err.message || err);
    }
  }

  if (csvRows.length > 0) {
    const csvBody = [csvHeader, ...csvRows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');
    const lines = '\\ufeff' + csvBody; // UTF-8 BOM to preserve emoji/formatting in Excel/Sheets
    const outPath = path.resolve(process.cwd(), CSV_OUT);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, lines, 'utf8');
    console.log(`CSV written to: ${outPath} (${csvRows.length} rows)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


