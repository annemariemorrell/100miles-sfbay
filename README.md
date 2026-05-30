# 100 Miles SF Bay

A personal open water swim tracker for Aquatic Park in San Francisco Bay. The season runs June 1 through October 31 with a 100-mile goal.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase database

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

3. Copy the environment example and add your Supabase values:

   ```bash
   cp .env.local.example .env.local
   ```

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open http://localhost:3000 to view the dashboard.

## Database

The app expects a `swims` table with:

- `id` - auto-generated primary key
- `date` - swim date
- `distance_miles` - decimal mileage
- `notes` - optional text notes
- `created_at` - timestamp defaulting to now

This is intentionally configured as a no-login personal app. The included Supabase policies allow anonymous reads and inserts with the public anon key.
