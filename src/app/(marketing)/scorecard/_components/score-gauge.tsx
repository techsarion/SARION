/**
 * Pure SVG arc gauge for the operations score (0–100). No client JS, no deps —
 * safe in RSC, the print report, and inside the marketing theme. Colour follows
 * the score band so a low score reads as urgent.
 */

function bandColor(score: number): string {
  if (score < 40) return "#DC2626"; // danger
  if (score < 60) return "#D97706"; // warning
  if (score < 80) return "#2563EB"; // primary
  return "#059669"; // success
}

export function ScoreGauge({
  score,
  size = 180,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = Math.round(size * 0.09);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // 270° sweep starting bottom-left.
  const circumference = 2 * Math.PI * r;
  const arcFraction = 0.75; // 270 of 360
  const dash = circumference * arcFraction;
  const progress = dash * (clamped / 100);
  const color = bandColor(clamped);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Operations score ${clamped} out of 100`}
    >
      <g transform={`rotate(135 ${cx} ${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </g>
      <text
        x={cx}
        y={cy - size * 0.02}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: size * 0.28, fontWeight: 700, fill: "currentColor" }}
      >
        {clamped}
      </text>
      <text
        x={cx}
        y={cy + size * 0.22}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: size * 0.09, fill: "currentColor", opacity: 0.6 }}
      >
        {label ?? "/ 100"}
      </text>
    </svg>
  );
}
