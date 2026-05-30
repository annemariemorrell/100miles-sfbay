"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export type FormState = {
  error?: string;
  success?: boolean;
};

type SwimFields = {
  date: string;
  swimmer_name: string;
  distance_miles: number;
  notes: string | null;
};

type ParsedSwimFields =
  | { value: SwimFields; error?: never }
  | { error: string; value?: never };

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getConfiguredSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      supabase: null,
      error:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  return { supabase, error: null };
}

function parseSwimFields(formData: FormData): ParsedSwimFields {
  const date = getTrimmedValue(formData, "date");
  const swimmerName = getTrimmedValue(formData, "swimmer_name");
  const distanceValue = Number(formData.get("distance_miles"));
  const notesValue = getTrimmedValue(formData, "notes");

  if (!swimmerName) {
    return { error: "Pick your swimmer name before logging bay miles." };
  }

  if (!date) {
    return { error: "Please choose a swim date." };
  }

  if (!Number.isFinite(distanceValue) || distanceValue <= 0) {
    return { error: "Distance must be greater than 0 miles." };
  }

  return {
    value: {
      date,
      swimmer_name: swimmerName,
      distance_miles: Math.round(distanceValue * 100) / 100,
      notes: notesValue || null,
    },
  };
}

export async function createSwimAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseSwimFields(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { supabase, error: configurationError } = getConfiguredSupabase();

  if (!supabase) {
    return { error: configurationError ?? "Supabase is not configured." };
  }

  const { error } = await supabase.from("swims").insert(parsed.value);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateSwimAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseSwimFields(formData);
  const swimId = Number(formData.get("id"));

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  if (!Number.isInteger(swimId) || swimId <= 0) {
    return { error: "Could not find the swim to update." };
  }

  const { supabase, error: configurationError } = getConfiguredSupabase();

  if (!supabase) {
    return { error: configurationError ?? "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("swims")
    .update(parsed.value)
    .eq("id", swimId)
    .eq("swimmer_name", parsed.value.swimmer_name)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Only the swimmer who logged this swim can edit it." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteSwimAction(swimId: number, swimmerName: string): Promise<FormState> {
  const normalizedName = swimmerName.trim();

  if (!Number.isInteger(swimId) || swimId <= 0) {
    return { error: "Could not find the swim to delete." };
  }

  if (!normalizedName) {
    return { error: "Pick your swimmer name before changing swims." };
  }

  const { supabase, error: configurationError } = getConfiguredSupabase();

  if (!supabase) {
    return { error: configurationError ?? "Supabase is not configured." };
  }

  const { data, error } = await supabase
    .from("swims")
    .delete()
    .eq("id", swimId)
    .eq("swimmer_name", normalizedName)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Only the swimmer who logged this swim can delete it." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function createSealSightingAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const reportedBy = getTrimmedValue(formData, "reported_by");
  const noteValue = getTrimmedValue(formData, "note");
  const countValue = Number(formData.get("count"));

  if (!reportedBy) {
    return { error: "Pick your swimmer name before reporting seal sightings." };
  }

  if (!Number.isInteger(countValue) || countValue <= 0) {
    return { error: "Seal count must be a whole number greater than 0." };
  }

  const { supabase, error: configurationError } = getConfiguredSupabase();

  if (!supabase) {
    return { error: configurationError ?? "Supabase is not configured." };
  }

  const { error } = await supabase.from("seal_sightings").insert({
    count: countValue,
    reported_by: reportedBy,
    note: noteValue || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
