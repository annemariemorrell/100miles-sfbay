import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      swims: {
        Row: {
          id: number;
          date: string;
          distance_miles: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          date: string;
          distance_miles: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          date?: string;
          distance_miles?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Swim = Database["public"]["Tables"]["swims"]["Row"];

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
