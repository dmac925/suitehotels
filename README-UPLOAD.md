# Hotel Data Upload to Supabase

## Setup Instructions

### 1. Create Tables in Supabase

First, you need to create the tables in your Supabase database. 

Go to your Supabase dashboard:
1. Navigate to the SQL Editor
2. Copy and paste the contents of `create-tables.sql`
3. Click "Run" to create the tables

### 2. Run the Upload Script

After the tables are created, run the upload script:

```bash
node uploadHotelsToSupabase.js
```

## Database Schema

### Hotels Table
- Stores main hotel information
- Fields include: name, description, stars, rating, price, location coordinates, address details, etc.

### Rooms Table
- Stores room information for each hotel
- Linked to hotels table via `hotel_id` foreign key
- Fields include: room type, capacity, facilities, availability, pricing options, etc.

## Features

- ✅ Uploads all hotel data from `src/lib/data/hotelDataEmbedded.js`
- ✅ Creates proper relationships between hotels and rooms
- ✅ Handles errors gracefully and reports them
- ✅ Shows progress during upload
- ✅ Includes database indexes for optimal performance
- ✅ Row Level Security (RLS) enabled with public read policies

## Notes

- The script uses the service role key for full access to insert data
- Each hotel's rooms are linked via foreign key relationship
- Complex data (bed types, facilities, options) are stored as JSONB for flexibility
- Timestamps are automatically added for created_at and updated_at fields