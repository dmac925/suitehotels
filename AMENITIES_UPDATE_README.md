# Hotel Amenities Filter Update

## Overview
Updated the suite filtering system to work with the new amenity data structure from the `fetchHotelAmenities.js` script. The filters are now organized into four categories: Wellness, Dining, Services, and Unique Features.

## Changes Made

### 1. Database Schema Update
Added new JSONB columns to the `hotels` table for storing amenity data:
- `wellness_amenities`
- `dining_amenities`
- `services_amenities`
- `unique_points`

**To apply the database changes, run:**
```sql
-- Execute the SQL in add-amenities-columns.sql
```

### 2. New Filter Component
Created `src/lib/components/SuiteFilters.svelte` - a dedicated filter component with:
- Four dropdown filters for each amenity category
- Price range filter
- Guest count filter
- Hotel search
- Sort options

### 3. Updated Data Loading
Modified `src/routes/[city]/+page.server.ts` to:
- Fetch the new amenity columns from the database
- Include amenity data in the suite objects

### 4. Updated Filtering Logic
Modified `src/routes/[city]/+page.svelte` to:
- Use the new filter component
- Filter suites based on the amenity objects (checking the `name` field)
- Support URL parameters for all filter options

## Amenity Categories

### Wellness
- Hot Tub / Spa
- Sauna
- Steam Room
- Indoor/Outdoor pools
- Fitness centre
- Wellness treatments
- And more...

### Dining
- Fine dining restaurants
- Casual restaurants/cafés
- Bars/lounges
- Rooftop bars
- Afternoon tea service
- And more...

### Services
- 24-hour room service
- Valet parking
- Airport transfers
- Butler service
- Business centre
- Pet services
- And more...

### Unique Features
- Panoramic views
- Historical architecture
- Private terraces
- Art collections
- Prime locations
- Sustainability features
- And more...

## Next Steps

1. **Run the database migration** to add the amenity columns
2. **Run the fetchHotelAmenities.js script** to populate the amenity data:
   ```bash
   node fetchHotelAmenities.js
   ```
3. The filters will automatically work once the data is populated

## Testing
After populating the amenity data, test the filters by:
1. Navigating to a city page (e.g., `/london`)
2. Using the dropdown filters to select amenities
3. Verifying that the suite list updates accordingly
4. Checking that URL parameters are preserved when navigating