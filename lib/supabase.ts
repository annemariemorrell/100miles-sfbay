import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Swim = {
  id: number;
  date: string;
  distance_miles: number;
  notes: string | null;
  created_at: string;
};

type SwimInsert = {
  date: string;
  distance_miles: number;
  notes?: string | null;
};

export type Database = {
  public: {
    Tables: {
      swims: {
        Row: Swim;
        Insert: SwimInsert;
        Update: Partial<SwimInsert>;
      };
    };
  };
};

export function getSupabaseClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
