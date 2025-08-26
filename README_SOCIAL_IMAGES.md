# Property Social Images Generator

This script generates optimized Instagram carousel images for properties and stores them in R2/Cloudflare storage.

## Features

- Automatically fetches properties from Supabase
- Downloads and processes property images
- Creates perfectly square 1080x1080 images optimized for Instagram carousels
- Smart cropping to focus on the most interesting parts of images
- Uploads processed images to R2/Cloudflare storage
- Updates the `social_images` JSON column in the properties table
- Supports dry-run mode for testing
- Concurrent processing with configurable limits

## Setup

1. **Install dependencies** (already done if you ran npm install):
   ```bash
   npm install sharp @aws-sdk/client-s3 @aws-sdk/lib-storage dotenv p-limit
   ```

2. **Configure environment variables**:
   - Copy `.env.example.social` to `.env`
   - Fill in your Supabase and R2 credentials

3. **Ensure R2 bucket is configured**:
   - Your R2 bucket should be publicly accessible for image serving
   - Configure custom domain if desired (e.g., images.offmarketprime.com)

## Usage

### Basic usage (process up to 10 properties):
```bash
node generate_property_social_images.js
```

### Dry run (test without uploading or updating):
```bash
node generate_property_social_images.js --dry-run
```

### Process specific property by ID:
```bash
node generate_property_social_images.js --id=uuid-here
```

### Process more properties:
```bash
node generate_property_social_images.js --limit=50
```

### Combine options:
```bash
node generate_property_social_images.js --dry-run --limit=5
```

## How it Works

1. **Fetches properties** from Supabase that:
   - Have images
   - Are published (`is_published = true`)
   - Don't already have social_images (unless specific ID provided)

2. **For each property**:
   - Downloads original images (up to 10 per property)
   - Resizes to 1080x1080 with smart cropping
   - Optimizes for web (JPEG, 85% quality, progressive)
   - Uploads to R2 with organized folder structure
   - Updates property record with social_images array

3. **Image Storage Structure**:
   ```
   social/properties/{property-slug}/{timestamp}-{hash}/carousel-{number}.jpg
   ```

## Image Specifications

- **Size**: 1080x1080 pixels (Instagram optimal square)
- **Format**: JPEG
- **Quality**: 85% (balance between quality and file size)
- **Cropping**: Smart attention-based cropping
- **Max images per property**: 10 (configurable)

## Database Schema

The script updates the `social_images` column in the `properties` table:

```sql
social_images jsonb DEFAULT '[]'::jsonb
```

The JSON array contains URLs of the processed images:
```json
[
  "https://images.offmarketprime.com/social/properties/...",
  "https://images.offmarketprime.com/social/properties/...",
  ...
]
```

## Error Handling

- Failed image downloads are skipped
- Properties with no valid images are skipped
- Partial success is possible (some images processed, others failed)
- All errors are logged with details

## Performance

- Concurrent image processing (3 images at a time by default)
- Efficient memory usage with streaming
- Progressive JPEG encoding for faster loading

## Monitoring

The script provides detailed output:
- Progress for each property
- Individual image processing status
- Summary statistics at the end
- Error reporting

## Integration with Instagram

The generated images are optimized for Instagram carousels:
- Perfect 1:1 aspect ratio
- High quality but reasonable file size
- Can be used directly in Instagram posts
- Support for up to 10 images per carousel (Instagram's limit)