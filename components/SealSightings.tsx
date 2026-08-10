"use client";

import { useActionState, useEffect } from "react";
import { createSealSightingAction, type FormState } from "@/app/actions";
import { celebrate } from "@/lib/confetti";
import { formatDateTime } from "@/lib/format";
import type { SealSighting } from "@/lib/supabase";

const initialState: FormState = {};

type SealSightingsProps = {
  onReportClick: () => void;
  sealSightings: SealSighting[];
  showForm: boolean;
  swimmerName: string;
  onCancelReport: () => void;
  onReportSuccess: () => void;
};

type SealReportFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
  swimmerName: string;
};

function SealReportForm({ onCancel, onSuccess, swimmerName }: SealReportFormProps) {
  const [state, formAction, isPending] = useActionState(createSealSightingAction, initialState);

  useEffect(() => {
    if (state.success) {
      celebrate();
      onSuccess();
    }
  }, [onSuccess, state.success]);

  return (
    <form action={formAction} className="mt-5 space-y-4 rounded-3xl border border-[#DDF6EE] bg-white/90 p-5">
      <input name="reported_by" type="hidden" value={swimmerName} />
      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">How many seals?</span>
        <input
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
          min="1"
          name="count"
          placeholder="2"
          required
          step="1"
          type="number"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Optional note</span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
          name="note"
          placeholder="Where were they lounging?"
        />
      </label>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Reporting..." : "Report seals"}
        </button>
      </div>
    </form>
  );
}

export function SealSightings({
  onCancelReport,
  onReportClick,
  onReportSuccess,
  sealSightings,
  showForm,
  swimmerName,
}: SealSightingsProps) {
  const totalSeals = sealSightings.reduce((total, sighting) => total + Number(sighting.count), 0);

  return (
    <section className="mt-12 rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1D9E75]">
            Seal watch
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Seals spotted</h2>
          <p className="mt-2 text-slate-500">Track every whiskered spectator cheering on the pod.</p>
        </div>
        <div className="rounded-3xl bg-[#DDF6EE] px-6 py-4 text-center text-[#13785A]">
          <p className="text-4xl font-semibold">{totalSeals}</p>
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">total seals</p>
        </div>
      </div>

      <button
        className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A]"
        onClick={onReportClick}
        type="button"
      >
        + Report seals
      </button>

      {showForm ? (
        <SealReportForm
          onCancel={onCancelReport}
          onSuccess={onReportSuccess}
          swimmerName={swimmerName}
        />
      ) : null}

      <div className="mt-7">
        <h3 className="text-lg font-semibold text-slate-950">Recent sightings</h3>
        {sealSightings.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500">
            No seals reported yet — keep your goggles ready.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white/85">
            {sealSightings.slice(0, 6).map((sighting) => (
              <li className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-start" key={sighting.id}>
                <div>
                  <p className="font-semibold text-slate-950">
                    {sighting.reported_by} spotted {sighting.count} seal{sighting.count === 1 ? "" : "s"}
                  </p>
                  <p className="text-sm text-slate-500">{formatDateTime(sighting.created_at)}</p>
                  {sighting.note ? <p className="mt-2 text-slate-600">{sighting.note}</p> : null}
                </div>
                <p className="text-2xl" aria-hidden="true">🦭</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
