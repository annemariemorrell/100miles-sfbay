import Link from "next/link";
import { ProgressRing } from "@/components/ProgressRing";
import { RecentSwims } from "@/components/RecentSwims";
import { StatCard } from "@/components/StatCard";
import { formatMiles } from "@/lib/format";
import { getDaysRemainingInSeason, getGoalMiles } from "@/lib/season";
import { getSwims } from "@/lib/swims";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { swims, isConfigured, error } = await getSwims();
  const goalMiles = getGoalMiles();
  const totalMiles = swims.reduce((total, swim) => total + Number(swim.distance_miles), 0);
  const averageDistance = swims.length > 0 ? totalMiles / swims.length : 0;
  const daysRemaining = getDaysRemainingInSeason();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:py-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1D9E75]">
            Aquatic Park season tracker
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            100 Miles SF Bay
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Log open water swims from June 1 through October 31 and keep the 100-mile goal in sight.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A]"
          href="/log"
        >
          Log a swim
        </Link>
      </header>

      {!isConfigured ? (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          Supabase is not configured yet. Copy <code>.env.local.example</code> to <code>.env.local</code> and add your project URL and anon key.
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          Could not load swims: {error}
        </div>
      ) : null}

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
        <div className="flex justify-center rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-soft backdrop-blur">
          <ProgressRing totalMiles={totalMiles} goalMiles={goalMiles} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Total swims" value={String(swims.length)} helper="Logged this season" />
          <StatCard
            label="Average distance"
            value={`${formatMiles(averageDistance)} mi`}
            helper="Per swim"
          />
          <StatCard
            label="Days remaining"
            value={String(daysRemaining)}
            helper="Season ends Oct 31"
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Recent swims</h2>
            <p className="mt-1 text-slate-500">Date, distance, and notes from your latest entries.</p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {formatMiles(Math.max(goalMiles - totalMiles, 0))} miles to go
          </p>
        </div>
        <RecentSwims swims={swims} />
      </section>
    </main>
  );
}
