import { formatMiles } from "@/lib/format";
import { getPodEntries } from "@/lib/pod-stats";
import type { Swim } from "@/lib/supabase";

type PodLeaderboardProps = {
  currentSwimmerName: string;
  swims: Swim[];
};

export function PodLeaderboard({ currentSwimmerName, swims }: PodLeaderboardProps) {
  const leaderboard = getPodEntries(swims);

  return (
    <section className="mt-12">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Pod leaderboard</h2>
        <p className="mt-1 text-slate-500">Everyone in the bay pod, sorted by total season miles.</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
          No pod miles yet — the seals are saving your lane.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-soft backdrop-blur">
          <ol className="divide-y divide-slate-100">
            {leaderboard.map((entry, index) => {
              const isCurrentSwimmer = entry.name === currentSwimmerName;

              return (
                <li className="grid gap-3 p-5 sm:grid-cols-[4rem_1fr_8rem_8rem] sm:items-center" key={entry.name}>
                  <p className="text-lg font-semibold text-slate-400">#{index + 1}</p>
                  <div>
                    <p className="font-semibold text-slate-950">
                      {entry.name}
                      {isCurrentSwimmer ? (
                        <span className="ml-2 rounded-full bg-[#DDF6EE] px-2 py-1 text-xs font-semibold text-[#13785A]">
                          you
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-slate-500">Bay pod swimmer</p>
                  </div>
                  <p className="font-semibold text-[#1D9E75]">{formatMiles(entry.totalMiles)} mi</p>
                  <p className="text-slate-500">{entry.totalSwims} swims</p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
