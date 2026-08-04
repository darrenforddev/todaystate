type CircularGaugeProps = {
  value: number;
  label: string;
  suffix?: string;
  size?: number;
};

export default function CircularGauge({
  value,
  label,
  suffix = "",
  size = 150,
}: CircularGaugeProps) {
  const safeValue = Math.max(0, Math.min(value, 100));

  const strokeWidth = 10;
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="-rotate-90"
          aria-label={`${label}: ${safeValue}${suffix}`}
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />

          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className="text-emerald-300 transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black text-white">
            {safeValue}
            {suffix}
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
