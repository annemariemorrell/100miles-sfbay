"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  createSwimAction,
  type FormState,
  updateSwimAction,
} from "@/app/actions";
import { useSwimmerIdentity } from "@/hooks/useSwimmerIdentity";
import { celebrate, celebrateGoal } from "@/lib/confetti";
import type { Swim } from "@/lib/supabase";

const initialState: FormState = {};

type LogSwimFormProps = {
  defaultDate: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  swim?: Swim;
  swimmerName?: string;
};

export function LogSwimForm({
  defaultDate,
  onCancel,
  onSuccess,
  swim,
  swimmerName,
}: LogSwimFormProps) {
  const router = useRouter();
  const { swimmerName: storedSwimmerName, isLoaded, saveSwimmerName } = useSwimmerIdentity();
  const currentSwimmerName = swimmerName ?? storedSwimmerName;
  const [nameDraft, setNameDraft] = useState(currentSwimmerName);
  const action = swim ? updateSwimAction : createSwimAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    if (state.reachedGoal) {
      celebrateGoal();
    } else {
      celebrate();
    }

    if (onSuccess) {
      onSuccess();
      return;
    }

    router.push("/");
    router.refresh();
  }, [onSuccess, router, state.reachedGoal, state.success]);

  if (!currentSwimmerName && isLoaded) {
    return (
      <form
        className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          saveSwimmerName(nameDraft);
        }}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1D9E75]">
            Join the pod
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">What&apos;s your name?</h2>
          <p className="mt-2 text-slate-500">
            Pick a swimmer name so these miles can follow your wake.
          </p>
        </div>
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
          onChange={(event) => setNameDraft(event.target.value)}
          placeholder="Your swimmer name"
          required
          value={nameDraft}
        />
        <button
          className="inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A]"
          type="submit"
        >
          Start swimming
        </button>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
      <input name="swimmer_name" type="hidden" value={currentSwimmerName} />
      {swim ? <input name="id" type="hidden" value={swim.id} /> : null}

      <div className="rounded-2xl bg-[#DDF6EE] px-4 py-3 text-sm font-medium text-[#13785A]">
        Swimming as {currentSwimmerName}. These miles will be tagged to your pod name.
      </div>

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
          defaultValue={swim?.date ?? defaultDate}
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
          defaultValue={swim ? Number(swim.distance_miles) : undefined}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Notes</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-[#1D9E75] focus:ring-4 focus:ring-[#1D9E75]/15"
          name="notes"
          placeholder="Conditions, route, seal escorts..."
          defaultValue={swim?.notes ?? ""}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : (
          <Link
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            href="/"
          >
            Cancel
          </Link>
        )}
        <button
          className="inline-flex items-center justify-center rounded-full bg-[#1D9E75] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1D9E75]/20 transition hover:bg-[#13785A] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || !currentSwimmerName}
          type="submit"
        >
          {isPending ? "Saving..." : swim ? "Save changes" : "Save swim"}
        </button>
      </div>
    </form>
  );
}
