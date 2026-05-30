"use client";

import { formatMiles, formatSwimDate } from "@/lib/format";
import type { Swim } from "@/lib/supabase";

type RecentSwimsProps = {
  currentSwimmerName: string;
  deletingId?: number | null;
  onDelete: (swim: Swim) => void;
  onEdit: (swim: Swim) => void;
  swims: Swim[];
};

function PencilIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L8.582 18.07a4.5 4.5 0 0 1-1.897 1.13L3 20l.8-3.685a4.5 4.5 0 0 1 1.13-1.897l11.932-11.931Z" />
      <path d="m19.5 7.125-2.625-2.625" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m14.74 9-.346 9m-4.788 0L9.26 9" />
      <path d="m19.228 5.79-.91 14.105A2.25 2.25 0 0 1 16.072 22H7.928a2.25 2.25 0 0 1-2.246-2.105L4.772 5.79" />
      <path d="M3 5.79h18" />
      <path d="M8.25 5.79V4.5A2.25 2.25 0 0 1 10.5 2.25h3A2.25 2.25 0 0 1 15.75 4.5v1.29" />
    </svg>
  );
}

export function RecentSwims({
  currentSwimmerName,
  deletingId,
  onDelete,
  onEdit,
  swims,
}: RecentSwimsProps) {
  if (swims.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
        No swims yet — the seals are waiting at the cove.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-soft backdrop-blur">
      <ul className="divide-y divide-slate-100">
        {swims.slice(0, 8).map((swim) => {
          const canManage = swim.swimmer_name === currentSwimmerName;

          return (
            <li key={swim.id} className="grid gap-4 p-5 sm:grid-cols-[10rem_8rem_1fr_auto] sm:items-start">
              <div>
                <p className="font-semibold text-slate-950">{formatSwimDate(swim.date)}</p>
                <p className="text-sm text-slate-500">Aquatic Park</p>
              </div>
              <p className="text-lg font-semibold text-[#1D9E75]">
                {formatMiles(Number(swim.distance_miles))} mi
              </p>
              <p className="text-slate-600">{swim.notes || "No notes added — just smooth water."}</p>
              {canManage ? (
                <div className="flex gap-2 sm:justify-end">
                  <button
                    aria-label={`Edit swim from ${formatSwimDate(swim.date)}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-[#1D9E75] hover:text-[#13785A]"
                    onClick={() => onEdit(swim)}
                    type="button"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    aria-label={`Delete swim from ${formatSwimDate(swim.date)}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-100 text-red-500 transition hover:border-red-200 hover:bg-red-50"
                    disabled={deletingId === swim.id}
                    onClick={() => onDelete(swim)}
                    type="button"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
