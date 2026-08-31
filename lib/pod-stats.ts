import {
  getDaysRemainingInSeason,
  getExpectedMiles,
  getMilesPerWeekNeeded,
  getPaceStatus,
  type PaceStatus,
} from "@/lib/season";
import type { Swim } from "@/lib/supabase";

export type PodEntry = {
  name: string;
  totalMiles: number;
  totalSwims: number;
};

export type PodPacingStats = {
  averageMiles: number;
  averageProgress: number;
  expectedMiles: number;
  expectedProgress: number;
  milesPerWeekNeeded: number;
  paceDelta: number;
  paceStatus: PaceStatus;
  swimmerCount: number;
  swimmersOnPace: number;
  totalPodMiles: number;
  entries: PodEntry[];
};

function normalizeSwimmerName(name: string) {
  return name.trim() || "Mystery swimmer";
}

export function getPodEntries(swims: Swim[]): PodEntry[] {
  const entries = new Map<string, PodEntry>();

  for (const swim of swims) {
    const name = normalizeSwimmerName(swim.swimmer_name);
    const existing = entries.get(name) ?? {
      name,
      totalMiles: 0,
      totalSwims: 0,
    };

    existing.totalMiles += Number(swim.distance_miles);
    existing.totalSwims += 1;
    entries.set(name, existing);
  }

  return Array.from(entries.values()).sort((first, second) => {
    if (second.totalMiles !== first.totalMiles) {
      return second.totalMiles - first.totalMiles;
    }

    return first.name.localeCompare(second.name);
  });
}

export function getPodPacingStats(
  swims: Swim[],
  goalMiles: number,
  now = new Date(),
): PodPacingStats {
  const entries = getPodEntries(swims);
  const swimmerCount = entries.length;
  const totalPodMiles = entries.reduce((total, entry) => total + entry.totalMiles, 0);
  const averageMiles = swimmerCount > 0 ? totalPodMiles / swimmerCount : 0;
  const averageProgress = goalMiles > 0 ? averageMiles / goalMiles : 0;
  const expectedMiles = getExpectedMiles(now, goalMiles);
  const expectedProgress = goalMiles > 0 ? expectedMiles / goalMiles : 0;
  const paceDelta = averageMiles - expectedMiles;
  const paceStatus = getPaceStatus(averageMiles, now, goalMiles);
  const daysRemaining = getDaysRemainingInSeason(now);
  const milesPerWeekNeeded = getMilesPerWeekNeeded(averageMiles, daysRemaining, goalMiles);
  const swimmersOnPace = entries.filter((entry) => {
    const status = getPaceStatus(entry.totalMiles, now, goalMiles);
    return status === "ahead" || status === "on-pace" || status === "complete";
  }).length;

  return {
    averageMiles,
    averageProgress,
    expectedMiles,
    expectedProgress,
    milesPerWeekNeeded,
    paceDelta,
    paceStatus,
    swimmerCount,
    swimmersOnPace,
    totalPodMiles,
    entries,
  };
}
