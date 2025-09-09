-- Add main_image column to rooms table if it doesn't exist
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS main_image TEXT;