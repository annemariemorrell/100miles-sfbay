import { getSupabaseClient, type Swim } from "@/lib/supabase";

export type SwimSummary = {
  swims: Swim[];
  isConfigured: boolean;
  error: string | null;
};

export async function getSwims(): Promise<SwimSummary> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      swims: [],
      isConfigured: false,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("swims")
    .select("id,date,distance_miles,notes,created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      swims: [],
      isConfigured: true,
      error: error.message,
    };
  }

  return {
    swims: data ?? [],
    isConfigured: true,
    error: null,
  };
}
