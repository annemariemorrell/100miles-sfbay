import { formatMiles, formatSwimDate } from "@/lib/format";
import type { Swim } from "@/lib/supabase";

type RecentSwimsProps = {
  swims: Swim[];
};

export function RecentSwims({ swims }: RecentSwimsProps) {
  if (swims.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
        No swims logged yet. Add your first Aquatic Park swim to start the season.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-soft backdrop-blur">
      <ul className="divide-y divide-slate-100">
        {swims.slice(0, 8).map((swim) => (
          <li key={swim.id} className="grid gap-3 p-5 sm:grid-cols-[10rem_8rem_1fr] sm:items-start">
            <div>
              <p className="font-semibold text-slate-950">{formatSwimDate(swim.date)}</p>
              <p className="text-sm text-slate-500">Aquatic Park</p>
            </div>
            <p className="text-lg font-semibold text-[#1D9E75]">
              {formatMiles(Number(swim.distance_miles))} mi
            </p>
            <p className="text-slate-600">{swim.notes || "No notes added."}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
