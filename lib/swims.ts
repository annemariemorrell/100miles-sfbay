import { getSupabaseClient, type SealSighting, type Swim } from "@/lib/supabase";

export type DataSummary<T> = {
  data: T[];
  isConfigured: boolean;
  error: string | null;
};

export async function getSwims(): Promise<DataSummary<Swim>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      data: [],
      isConfigured: false,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("swims")
    .select("id,date,distance_miles,notes,swimmer_name,created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: [],
      isConfigured: true,
      error: error.message,
    };
  }

  return {
    data: data ?? [],
    isConfigured: true,
    error: null,
  };
}

export async function getSealSightings(): Promise<DataSummary<SealSighting>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      data: [],
      isConfigured: false,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("seal_sightings")
    .select("id,count,reported_by,note,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: [],
      isConfigured: true,
      error: error.message,
    };
  }

  return {
    data: data ?? [],
    isConfigured: true,
    error: null,
  };
}
