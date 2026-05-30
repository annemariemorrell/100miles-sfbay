import { formatMiles } from "@/lib/format";

type ProgressRingProps = {
  totalMiles: number;
  goalMiles: number;
};

export function ProgressRing({ totalMiles, goalMiles }: ProgressRingProps) {
  const radius = 92;
  const strokeWidth = 16;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(totalMiles / goalMiles, 1);
  const strokeDashoffset = circumference - progress * circumference;
  const percentage = Math.round(progress * 100);

  return (
    <div className="relative flex aspect-square w-full max-w-[19rem] items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 184 184" role="img" aria-label={`${percentage}% of season goal completed`}>
        <circle
          cx="92"
          cy="92"
          r={normalizedRadius}
          fill="transparent"
          stroke="#DDEDE8"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="92"
          cy="92"
          r={normalizedRadius}
          fill="transparent"
          stroke="#1D9E75"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-5xl font-semibold tracking-tight text-slate-950">
          {formatMiles(totalMiles)}
        </p>
        <p className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
          of {goalMiles} miles
        </p>
        <p className="mt-3 text-lg font-semibold text-[#1D9E75]">{percentage}%</p>
      </div>
    </div>
  );
}
