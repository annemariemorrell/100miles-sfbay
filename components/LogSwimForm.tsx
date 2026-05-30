"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createSwimAction, type LogSwimState } from "@/app/actions";

const initialState: LogSwimState = {};

type LogSwimFormProps = {
  defaultDate: string;
};

export function LogSwimForm({ defaultDate }: LogSwimFormProps) {
  const [state, formAction, isPending] = useActionState(createSwimAction, initialState);

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Date</span>
        <input
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
          name="date"
          type="date"
          required
          defaultValue={defaultDate}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Distance in miles</span>
        <input
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
          name="distance_miles"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="1.25"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Notes</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
          name="notes"
          placeholder="Conditions, route, wildlife sightings..."
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          href="/"
        >
          Cancel
        </Link>
        <button
          className="inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving..." : "Save swim"}
        </button>
      </div>
    </form>
  );
}
