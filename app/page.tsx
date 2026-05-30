import { SwimDashboard } from "@/components/SwimDashboard";
import { getDaysRemainingInSeason, getGoalMiles } from "@/lib/season";
import { getSealSightings, getSwims } from "@/lib/swims";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [swimSummary, sealSummary] = await Promise.all([getSwims(), getSealSightings()]);

  return (
    <SwimDashboard
      daysRemaining={getDaysRemainingInSeason()}
      goalMiles={getGoalMiles()}
      isConfigured={swimSummary.isConfigured && sealSummary.isConfigured}
      sealSightings={sealSummary.data}
      sealSightingsError={sealSummary.error}
      swims={swimSummary.data}
      swimsError={swimSummary.error}
    />
  );
}
