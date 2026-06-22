/**
 * Pure SVG radar chart for the four pillar scores (0–100). No client JS, no
 * deps. Uses currentColor so it adapts to light/dark + print contexts.
 */
import { PILLARS, PILLAR_ORDER, type PillarKey } from "@/config/scorecard";

export function PillarRadar({
  scores,
  size = 260,
}: {
  scores: Record<PillarKey, number>;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const axes = PILLAR_ORDER;
  const angleFor = (i: number) => (Math.PI * 2 * i) / axes.length - Math.PI / 2;

  const point = (i: number, value: number) => {
    const a = angleFor(i);
    const r = radius * (Math.max(0, Math.min(100, value)) / 100);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };

  const ring = (frac: number) =>
    axes
      .map((_, i) => {
        const a = angleFor(i);
        const r = radius * frac;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      })
      .join(" ");

  const dataPolygon = axes.map((k, i) => point(i, scores[k]).join(",")).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Pillar scores radar chart"
    >
      {/* grid rings */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={ring(f)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
        />
      ))}
      {/* axes */}
      {axes.map((_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.12}
          />
        );
      })}
      {/* data */}
      <polygon
        points={dataPolygon}
        fill="#2563EB"
        fillOpacity={0.18}
        stroke="#2563EB"
        strokeWidth={2}
      />
      {/* labels */}
      {axes.map((k, i) => {
        const [x, y] = point(i, 122);
        return (
          <text
            key={k}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: size * 0.045, fill: "currentColor", opacity: 0.7 }}
          >
            {PILLARS[k].name.split(" ")[0]}
          </text>
        );
      })}
    </svg>
  );
}
