const GOAL_MILES = 100;
const SEASON_START_MONTH_INDEX = 5;
const SEASON_START_DAY = 1;
const SEASON_END_MONTH_INDEX = 9;
const SEASON_END_DAY = 31;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getGoalMiles() {
  return GOAL_MILES;
}

function getSeasonStart(now = new Date()) {
  return new Date(
    now.getFullYear(),
    SEASON_START_MONTH_INDEX,
    SEASON_START_DAY,
    0,
    0,
    0,
    0,
  );
}

function getSeasonEnd(now = new Date()) {
  return new Date(
    now.getFullYear(),
    SEASON_END_MONTH_INDEX,
    SEASON_END_DAY,
    23,
    59,
    59,
    999,
  );
}

export function getSeasonDayCount(now = new Date()) {
  const start = getSeasonStart(now);
  const end = getSeasonEnd(now);

  return Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

export function getDaysElapsedInSeason(now = new Date()) {
  const start = getSeasonStart(now);
  const end = getSeasonEnd(now);

  if (now < start) {
    return 0;
  }

  if (now > end) {
    return getSeasonDayCount(now);
  }

  return Math.floor((now.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

export function getDaysRemainingInSeason(now = new Date()) {
  const endOfSeason = getSeasonEnd(now);

  if (now > endOfSeason) {
    return 0;
  }

  return Math.ceil((endOfSeason.getTime() - now.getTime()) / MS_PER_DAY);
}

export function getSeasonProgress(now = new Date()) {
  const totalDays = getSeasonDayCount(now);

  if (totalDays === 0) {
    return 0;
  }

  return Math.min(getDaysElapsedInSeason(now) / totalDays, 1);
}

export function getExpectedMiles(now = new Date(), goalMiles = GOAL_MILES) {
  return getSeasonProgress(now) * goalMiles;
}

export function getMilesPerWeekNeeded(
  totalMiles: number,
  daysRemaining: number,
  goalMiles = GOAL_MILES,
) {
  const milesRemaining = Math.max(goalMiles - totalMiles, 0);

  if (daysRemaining <= 0) {
    return milesRemaining > 0 ? milesRemaining : 0;
  }

  return milesRemaining / (daysRemaining / 7);
}

export type PaceStatus = "ahead" | "on-pace" | "behind" | "complete" | "pre-season" | "post-season";

export function getPaceStatus(
  totalMiles: number,
  now = new Date(),
  goalMiles = GOAL_MILES,
): PaceStatus {
  const start = getSeasonStart(now);
  const end = getSeasonEnd(now);

  if (now < start) {
    return "pre-season";
  }

  if (totalMiles >= goalMiles) {
    return "complete";
  }

  if (now > end) {
    return "post-season";
  }

  const expectedMiles = getExpectedMiles(now, goalMiles);
  const delta = totalMiles - expectedMiles;
  const tolerance = goalMiles * 0.02;

  if (delta > tolerance) {
    return "ahead";
  }

  if (delta < -tolerance) {
    return "behind";
  }

  return "on-pace";
}
