#!/usr/bin/env node

/**
 * Script to generate Instagram carousel images for properties
 * - Creates optimized square images (1080x1080) for Instagram carousels
 * - Uploads images to R2 storage
 * - Updates properties table with social_images JSON column
 */

import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pLimit from 'p-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configuration
const CONFIG = {
  // Instagram optimal square size
  imageSize: 1080,
  imageQuality: 85,
  maxImagesPerProperty: 10,
  
  // R2 Configuration
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME || 'offmarket-images',
    publicUrl: process.env.R2_PUBLIC_URL || 'https://images.offmarketprime.com',
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  },
  
  // Supabase Configuration
  supabase: {
    url: process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// Parse command line arguments
const DRY_RUN = process.argv.includes('--dry-run');
const PROPERTY_ID = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1];
const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10');

// Initialize clients
let s3Client;
let supabase;

function initializeClients() {
  // Initialize R2/S3 client
  if (!DRY_RUN && CONFIG.r2.accessKeyId && CONFIG.r2.secretAccessKey) {
    s3Client = new S3Client({
      region: CONFIG.r2.region,
      endpoint: CONFIG.r2.endpoint,
      credentials: {
        accessKeyId: CONFIG.r2.accessKeyId,
        secretAccessKey: CONFIG.r2.secretAccessKey
      }
    });
  }
  
  // Initialize Supabase client
  if (!CONFIG.supabase.url || !CONFIG.supabase.anonKey) {
    throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
  }
  
  supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
}

/**
 * Download image from URL to buffer
 */
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Process and optimize image for Instagram carousel
 * Creates a perfect square with smart cropping
 */
async function processImageForCarousel(imageBuffer) {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Create square image with smart cropping
    const processed = await image
      .resize(CONFIG.imageSize, CONFIG.imageSize, {
        fit: 'cover',
        position: 'attention' // Smart crop to most interesting part
      })
      .jpeg({
        quality: CONFIG.imageQuality,
        progressive: true
      })
      .toBuffer();
    
    return {
      buffer: processed,
      contentType: 'image/jpeg',
      extension: 'jpg'
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

/**
 * Upload image to R2 storage
 */
async function uploadToR2(key, buffer, contentType) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would upload to R2: ${key}`);
    return `${CONFIG.r2.publicUrl}/${key}`;
  }
  
  if (!s3Client) {
    throw new Error('R2 client not initialized. Check R2 configuration in .env');
  }
  
  const command = new PutObjectCommand({
    Bucket: CONFIG.r2.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000'
  });
  
  await s3Client.send(command);
  return `${CONFIG.r2.publicUrl}/${key}`;
}

/**
 * Generate a unique key for R2 storage
 */
function generateR2Key(propertySlug, index) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const hash = crypto.randomBytes(4).toString('hex');
  return `social/properties/${propertySlug}/${timestamp}-${hash}/carousel-${index + 1}.jpg`;
}

/**
 * Extract image URLs from property images JSON
 */
function extractImageUrls(imagesData) {
  if (!imagesData) return [];
  
  try {
    const images = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
    
    if (Array.isArray(images)) {
      return images.map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.url || item.src || item.image_url || null;
        }
        return null;
      }).filter(Boolean);
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing images:', error);
    return [];
  }
}

/**
 * Fetch properties from Supabase
 */
async function fetchProperties() {
  let query = supabase
    .from('properties')
    .select('*')
    .not('images', 'is', null)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  
  // Add filters based on command line arguments
  if (PROPERTY_ID) {
    query = query.eq('id', PROPERTY_ID);
  } else {
    // Only fetch properties without social_images
    query = query.or('social_images.is.null,social_images.eq.[]');
  }
  
  query = query.limit(LIMIT);
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Process a single property
 */
async function processProperty(property) {
  console.log(`\nProcessing property: ${property.title || property.slug || property.id}`);
  
  // Skip if already has social_images (unless specific ID requested)
  if (!PROPERTY_ID && property.social_images && Array.isArray(property.social_images) && property.social_images.length > 0) {
    console.log('  → Skipping (already has social images)');
    return { property, skipped: true };
  }
  
  const imageUrls = extractImageUrls(property.images);
  
  if (imageUrls.length === 0) {
    console.log('  → Skipping (no images found)');
    return { property, skipped: true, reason: 'No images' };
  }
  
  const propertySlug = property.slug || `property-${property.id.slice(0, 8)}`;
  const imagesToProcess = imageUrls.slice(0, CONFIG.maxImagesPerProperty);
  
  console.log(`  → Found ${imageUrls.length} images, processing ${imagesToProcess.length}`);
  
  // Process images with concurrency limit
  const limit = pLimit(3);
  const socialImages = [];
  
  const processPromises = imagesToProcess.map((url, index) => 
    limit(async () => {
      try {
        console.log(`    - Processing image ${index + 1}/${imagesToProcess.length}`);
        
        // Download image
        const imageBuffer = await downloadImage(url);
        
        // Process for Instagram
        const { buffer, contentType } = await processImageForCarousel(imageBuffer);
        
        // Generate R2 key and upload
        const key = generateR2Key(propertySlug, index);
        const publicUrl = await uploadToR2(key, buffer, contentType);
        
        console.log(`    ✓ Uploaded image ${index + 1}: ${publicUrl}`);
        
        return {
          url: publicUrl,
          key: key,
          order: index
        };
      } catch (error) {
        console.error(`    ✗ Failed to process image ${index + 1}:`, error.message);
        return null;
      }
    })
  );
  
  const results = await Promise.all(processPromises);
  const successfulImages = results.filter(Boolean).sort((a, b) => a.order - b.order);
  
  if (successfulImages.length === 0) {
    console.log('  → No images successfully processed');
    return { property, failed: true };
  }
  
  // Update property with social_images
  if (!DRY_RUN) {
    const { data, error } = await supabase
      .from('properties')
      .update({
        social_images: successfulImages.map(img => img.url),
        updated_at: new Date().toISOString()
      })
      .eq('id', property.id)
      .select()
      .single();
    
    if (error) {
      console.error('  ✗ Failed to update property:', error.message);
      return { property, error };
    }
    
    console.log(`  ✓ Updated property with ${successfulImages.length} social images`);
    return { property: data, socialImages: successfulImages };
  }
  
  console.log(`  [DRY RUN] Would update property with ${successfulImages.length} social images`);
  return { property, socialImages: successfulImages, dryRun: true };
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Property Social Images Generator for Instagram');
  console.log('='.repeat(60));
  
  if (DRY_RUN) {
    console.log('\n🔸 DRY RUN MODE - No actual uploads or updates will be performed\n');
  }
  
  try {
    // Initialize clients
    initializeClients();
    
    // Fetch properties
    console.log('\nFetching properties...');
    const properties = await fetchProperties();
    
    if (properties.length === 0) {
      console.log('No properties to process.');
      return;
    }
    
    console.log(`Found ${properties.length} properties to process`);
    
    // Process each property
    const results = [];
    for (const property of properties) {
      const result = await processProperty(property);
      results.push(result);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.socialImages && !r.dryRun).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => r.failed || r.error).length;
    const dryRun = results.filter(r => r.dryRun).length;
    
    console.log(`✓ Successfully processed: ${successful}`);
    console.log(`→ Skipped: ${skipped}`);
    console.log(`✗ Failed: ${failed}`);
    if (DRY_RUN) {
      console.log(`🔸 Dry run processed: ${dryRun}`);
    }
    
    // Report any errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(({ property, error }) => {
        console.log(`  - ${property.title || property.id}: ${error.message || error}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export {
  processProperty,
  processImageForCarousel,
  uploadToR2
};