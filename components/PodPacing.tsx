import { formatMiles } from "@/lib/format";
import { getPodPacingStats } from "@/lib/pod-stats";
import type { PaceStatus } from "@/lib/season";
import type { Swim } from "@/lib/supabase";
import { StatCard } from "@/components/StatCard";

type PodPacingProps = {
  goalMiles: number;
  swims: Swim[];
};

function getPaceStatusLabel(status: PaceStatus) {
  switch (status) {
    case "ahead":
      return "Ahead of pace";
    case "on-pace":
      return "On pace";
    case "behind":
      return "Behind pace";
    case "complete":
      return "Goal reached";
    case "pre-season":
      return "Pre-season";
    case "post-season":
      return "Season ended";
  }
}

function getPaceStatusColor(status: PaceStatus) {
  switch (status) {
    case "ahead":
    case "complete":
      return "text-[#13785A]";
    case "on-pace":
      return "text-[#1D9E75]";
    case "behind":
    case "post-season":
      return "text-amber-700";
    case "pre-season":
      return "text-slate-500";
  }
}

function getPaceStatusBadgeClass(status: PaceStatus) {
  switch (status) {
    case "ahead":
    case "complete":
      return "bg-[#DDF6EE] text-[#13785A]";
    case "on-pace":
      return "bg-[#DDF6EE] text-[#1D9E75]";
    case "behind":
    case "post-season":
      return "bg-amber-50 text-amber-800";
    case "pre-season":
      return "bg-slate-100 text-slate-600";
  }
}

export function PodPacing({ goalMiles, swims }: PodPacingProps) {
  const stats = getPodPacingStats(swims, goalMiles);
  const progressPercent = Math.min(stats.averageProgress * 100, 100);
  const expectedPercent = Math.min(stats.expectedProgress * 100, 100);
  const paceDeltaLabel =
    stats.paceDelta === 0
      ? "Right on the line"
      : stats.paceDelta > 0
        ? `${formatMiles(stats.paceDelta)} mi ahead of expected`
        : `${formatMiles(Math.abs(stats.paceDelta))} mi behind expected`;
  const milesPerWeekLabel =
    stats.paceStatus === "complete"
      ? "Average goal reached"
      : stats.paceStatus === "pre-season"
        ? "Season starts June 1"
        : stats.paceStatus === "post-season"
          ? "Season is over"
          : `${formatMiles(stats.milesPerWeekNeeded)} mi/week avg`;

  return (
    <section className="mt-12">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1D9E75]">
          Pod pacing
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          How the pod is tracking toward {goalMiles} miles
        </h2>
        <p className="mt-1 text-slate-500">
          Average progress across {stats.swimmerCount === 1 ? "1 swimmer" : `${stats.swimmerCount} swimmers`} compared to the season timeline.
        </p>
      </div>

      {stats.swimmerCount === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
          Log the first pod swim to see collective pacing.
        </div>
      ) : (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pod average</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                {formatMiles(stats.averageMiles)}
                <span className="ml-2 text-lg font-medium text-slate-400">/ {goalMiles} mi</span>
              </p>
            </div>
            <span
              className={`inline-flex self-start rounded-full px-3 py-1 text-sm font-semibold ${getPaceStatusBadgeClass(stats.paceStatus)}`}
            >
              {getPaceStatusLabel(stats.paceStatus)}
            </span>
          </div>

          <div className="mt-8">
            <div className="relative h-4 overflow-hidden rounded-full bg-[#DDEDE8]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#1D9E75] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              {expectedPercent > 0 && expectedPercent < 100 ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 w-0.5 bg-slate-950/35"
                  style={{ left: `${expectedPercent}%` }}
                  title={`Expected pace: ${formatMiles(stats.expectedMiles)} mi`}
                />
              ) : null}
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <span className="font-semibold text-slate-700">{Math.round(progressPercent)}%</span> of pod average goal
              </p>
              <p className={getPaceStatusColor(stats.paceStatus)}>{paceDeltaLabel}</p>
              <p>
                Expected now: <span className="font-semibold text-slate-700">{formatMiles(stats.expectedMiles)} mi</span>
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              helper={`${formatMiles(stats.totalPodMiles)} mi logged total`}
              label="Pod average"
              value={`${formatMiles(stats.averageMiles)} mi`}
            />
            <StatCard
              helper={
                stats.swimmerCount === 0
                  ? "No swimmers yet"
                  : `${stats.swimmersOnPace} of ${stats.swimmerCount} on pace`
              }
              label="Swimmers on pace"
              value={`${stats.swimmersOnPace}/${stats.swimmerCount}`}
            />
            <StatCard
              helper="Per swimmer to finish on time"
              label="Avg miles needed"
              value={milesPerWeekLabel}
            />
            <StatCard
              helper={`Target pace: ${formatMiles(stats.expectedMiles)} mi`}
              label="Pace gap"
              value={
                stats.paceDelta === 0
                  ? "On line"
                  : stats.paceDelta > 0
                    ? `+${formatMiles(stats.paceDelta)} mi`
                    : `-${formatMiles(Math.abs(stats.paceDelta))} mi`
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}
