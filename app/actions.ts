"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export type LogSwimState = {
  error?: string;
};

export async function createSwimAction(
  _previousState: LogSwimState,
  formData: FormData,
): Promise<LogSwimState> {
  const date = String(formData.get("date") ?? "").trim();
  const distanceValue = Number(formData.get("distance_miles"));
  const notesValue = String(formData.get("notes") ?? "").trim();

  if (!date) {
    return { error: "Please choose a swim date." };
  }

  if (!Number.isFinite(distanceValue) || distanceValue <= 0) {
    return { error: "Distance must be greater than 0 miles." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      error:
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const { error } = await supabase.from("swims").insert({
    date,
    distance_miles: Math.round(distanceValue * 100) / 100,
    notes: notesValue || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  redirect("/");
}
