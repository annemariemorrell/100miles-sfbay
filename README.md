# 100 Miles SF Bay

A personal open water swim tracker for Aquatic Park in San Francisco Bay. The season runs June 1 through October 31 with a 100-mile goal, a shared pod leaderboard, and seal sightings along the way.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase database

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and run the SQL in `supabase/schema.sql` in the Supabase SQL editor. If you already created the first version of the app, run `supabase/migrations/202605302112_add_swimmers_and_seals.sql` instead.

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
- `swimmer_name` - local pod name stored in the browser
- `created_at` - timestamp defaulting to now

The app also expects a `seal_sightings` table with:

- `id` - UUID primary key
- `count` - number of seals spotted
- `reported_by` - local pod name stored in the browser
- `note` - optional text note
- `created_at` - timestamp defaulting to now

This is intentionally configured as a no-login pod app. The included Supabase policies allow anonymous reads and writes with the public anon key. Swim edit/delete actions match on the browser's stored swimmer name before changing rows.
