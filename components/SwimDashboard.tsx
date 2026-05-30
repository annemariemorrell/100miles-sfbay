"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSwimAction } from "@/app/actions";
import { FloatingSeals } from "@/components/FloatingSeals";
import { LogSwimForm } from "@/components/LogSwimForm";
import { PodLeaderboard } from "@/components/PodLeaderboard";
import { ProgressRing } from "@/components/ProgressRing";
import { RecentSwims } from "@/components/RecentSwims";
import { SealSightings } from "@/components/SealSightings";
import { StatCard } from "@/components/StatCard";
import { useSwimmerIdentity } from "@/hooks/useSwimmerIdentity";
import { formatMiles } from "@/lib/format";
import type { SealSighting, Swim } from "@/lib/supabase";

type SwimDashboardProps = {
  daysRemaining: number;
  goalMiles: number;
  isConfigured: boolean;
  sealSightings: SealSighting[];
  sealSightingsError: string | null;
  swims: Swim[];
  swimsError: string | null;
};

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function namesMatch(first: string, second: string) {
  return first.trim() === second.trim();
}

type WelcomeModalProps = {
  onSave: (name: string) => boolean;
};

function WelcomeModal({ onSave }: WelcomeModalProps) {
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-5 py-8 text-center backdrop-blur-sm">
      <div
        aria-labelledby="welcome-title"
        aria-modal="true"
        className="w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/95 p-8 shadow-soft sm:p-10"
        role="dialog"
      >
        <p className="text-5xl" aria-hidden="true">🦭</p>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#1D9E75]">
          Welcome to the bay pod
        </p>
        <h2 id="welcome-title" className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          What&apos;s your name?
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Pick a swimmer name to unlock your personal progress, log swims, and join the shared pod leaderboard.
        </p>
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (!onSave(draftName)) {
              setError("Please enter a swimmer name before diving in.");
            }
          }}
        >
          <input
            autoFocus
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
            onChange={(event) => {
              setDraftName(event.target.value);
              setError("");
            }}
            placeholder="Your swimmer name"
            value={draftName}
          />
          <button
            className="inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A]"
            type="submit"
          >
            Join the pod
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}


export function SwimDashboard({
  daysRemaining,
  goalMiles,
  isConfigured,
  sealSightings,
  sealSightingsError,
  swims,
  swimsError,
}: SwimDashboardProps) {
  const router = useRouter();
  const { swimmerName, isLoaded, saveSwimmerName } = useSwimmerIdentity();
  const [isChangingName, setIsChangingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(swimmerName);
  const [editingSwim, setEditingSwim] = useState<Swim | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, startDeleting] = useTransition();
  const [isReportingSeals, setIsReportingSeals] = useState(false);

  const mySwims = useMemo(
    () => swims.filter((swim) => namesMatch(swim.swimmer_name, swimmerName)),
    [swimmerName, swims],
  );
  const totalMiles = mySwims.reduce((total, swim) => total + Number(swim.distance_miles), 0);
  const averageDistance = mySwims.length > 0 ? totalMiles / mySwims.length : 0;

  if (!isLoaded) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:py-12">
        <div className="h-64 animate-pulse rounded-[2rem] bg-white/70" />
      </main>
    );
  }

  const handleDelete = (swim: Swim) => {
    if (!namesMatch(swim.swimmer_name, swimmerName)) {
      setDeleteError("Only the swimmer who logged this swim can delete it.");
      return;
    }

    if (!window.confirm(`Delete the ${formatMiles(Number(swim.distance_miles))} mile swim from ${swim.date}?`)) {
      return;
    }

    setDeleteError(null);
    setDeletingId(swim.id);
    startDeleting(async () => {
      const result = await deleteSwimAction(swim.id, swimmerName);

      if (result.error) {
        setDeleteError(result.error);
      } else {
        router.refresh();
      }

      setDeletingId(null);
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:py-12">
      <FloatingSeals />
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1D9E75]">
            Aquatic Park season tracker
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            <span aria-hidden="true" className="mr-3">🦭</span>
            100 Miles SF Bay
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Log open water swims from June 1 through October 31 and keep your 100-mile wake in sight.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="rounded-3xl border border-white/70 bg-white/85 px-4 py-3 text-sm shadow-soft backdrop-blur">
            {isChangingName ? (
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (saveSwimmerName(nameDraft)) {
                    setIsChangingName(false);
                    router.refresh();
                  }
                }}
              >
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 outline-none focus:border-[#1D9E75]"
                  onChange={(event) => setNameDraft(event.target.value)}
                  value={nameDraft}
                />
                <button className="font-semibold text-[#1D9E75]" type="submit">Save</button>
              </form>
            ) : !swimmerName ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-600">No swimmer selected</span>
                <button
                  className="font-semibold text-[#1D9E75] hover:text-[#13785A]"
                  onClick={() => {
                    setNameDraft("");
                    setIsChangingName(true);
                  }}
                  type="button"
                >
                  Set name
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-600">Swimming as</span>
                <span className="font-semibold text-slate-950">{swimmerName}</span>
                <button
                  className="font-semibold text-[#1D9E75] hover:text-[#13785A]"
                  onClick={() => {
                    setNameDraft(swimmerName);
                    setIsChangingName(true);
                  }}
                  type="button"
                >
                  Change
                </button>
              </div>
            )}
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A]"
            href="/log"
          >
            Log a swim
          </Link>
        </div>
      </header>

      {!isConfigured ? (
        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          Supabase is not configured yet. Copy <code>.env.local.example</code> to <code>.env.local</code> and add your project URL and anon key.
        </div>
      ) : null}

      {swimsError ? (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          Could not load swims: {swimsError}
        </div>
      ) : null}

      {sealSightingsError ? (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          Could not load seal sightings: {sealSightingsError}
        </div>
      ) : null}

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
        <div className="flex justify-center rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-soft backdrop-blur">
          <ProgressRing totalMiles={totalMiles} goalMiles={goalMiles} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Your swims" value={String(mySwims.length)} helper="Logged under your name" />
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
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Your recent swims</h2>
            <p className="mt-1 text-slate-500">Date, distance, and notes from your latest bay entries.</p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {formatMiles(Math.max(goalMiles - totalMiles, 0))} miles to go
          </p>
        </div>
        {deleteError ? (
          <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {deleteError}
          </div>
        ) : null}
        <RecentSwims
          currentSwimmerName={swimmerName}
          deletingId={isDeleting ? deletingId : null}
          onDelete={handleDelete}
          onEdit={setEditingSwim}
          swims={mySwims}
        />
      </section>

      {editingSwim ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-5 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 rounded-3xl bg-white/95 px-5 py-4 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-950">Edit swim</h2>
              <p className="mt-1 text-sm text-slate-500">Tune up this entry before it swims back into the log.</p>
            </div>
            <LogSwimForm
              defaultDate={getTodayInputValue()}
              onCancel={() => setEditingSwim(null)}
              onSuccess={() => {
                setEditingSwim(null);
                router.refresh();
              }}
              swim={editingSwim}
              swimmerName={swimmerName}
            />
          </div>
        </div>
      ) : null}

      <PodLeaderboard currentSwimmerName={swimmerName} swims={swims} />

      <SealSightings
        onCancelReport={() => setIsReportingSeals(false)}
        onReportClick={() => setIsReportingSeals(true)}
        onReportSuccess={() => {
          setIsReportingSeals(false);
          router.refresh();
        }}
        sealSightings={sealSightings}
        showForm={isReportingSeals}
        swimmerName={swimmerName}
      />
      {!swimmerName ? <WelcomeModal onSave={saveSwimmerName} /> : null}
    </main>
  );
}
