const GOAL_MILES = 100;
const SEASON_END_MONTH_INDEX = 9;
const SEASON_END_DAY = 31;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getGoalMiles() {
  return GOAL_MILES;
}

export function getDaysRemainingInSeason(now = new Date()) {
  const endOfSeason = new Date(
    now.getFullYear(),
    SEASON_END_MONTH_INDEX,
    SEASON_END_DAY,
    23,
    59,
    59,
    999,
  );

  if (now > endOfSeason) {
    return 0;
  }

  return Math.ceil((endOfSeason.getTime() - now.getTime()) / MS_PER_DAY);
}
