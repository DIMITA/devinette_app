import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface Props {
  pattern: string;
  accent: string;
}

export const BgDecoration: React.FC<Props> = ({ pattern, accent }) => {
  const frame = useCurrentFrame();
  if (pattern === "rays")      return <RaysBg frame={frame} />;
  if (pattern === "particles") return <ParticlesBg accent={accent} frame={frame} />;
  if (pattern === "dots")      return <DotsBg frame={frame} />;
  return null;
};

// ─── Sunburst rotating rays ───────────────────────────────────────────────────
const RaysBg: React.FC<{ frame: number }> = ({ frame }) => {
  const rotation = interpolate(frame, [0, 540], [0, 15]);
  return (
    <div
      style={{
        position: "absolute", top: "50%", left: "50%",
        width: 2400, height: 2400,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        opacity: 0.08,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: 1200, height: 60,
            background: "white",
            transformOrigin: "0 50%",
            transform: `translateY(-50%) rotate(${i * 30}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Floating accent-colored particles ───────────────────────────────────────
const PARTICLE_POSITIONS = [
  { x: 60, y: 180, size: 4 }, { x: 1020, y: 220, size: 3 },
  { x: 100, y: 600, size: 5 }, { x: 980, y: 550, size: 4 },
  { x: 80, y: 1400, size: 3 }, { x: 1000, y: 1450, size: 4 },
  { x: 150, y: 1700, size: 5 }, { x: 930, y: 1750, size: 3 },
  { x: 300, y: 120, size: 6 }, { x: 780, y: 130, size: 4 },
  { x: 200, y: 1900, size: 5 }, { x: 880, y: 1880, size: 4 },
];

const ParticlesBg: React.FC<{ accent: string; frame: number }> = ({ accent, frame }) => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    viewBox="0 0 1080 1920"
  >
    {PARTICLE_POSITIONS.map((p, i) => {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i * 0.8));
      return (
        <circle
          key={i}
          cx={p.x + Math.sin(frame * 0.03 + i) * 6}
          cy={p.y + Math.cos(frame * 0.03 + i) * 6}
          r={p.size * pulse}
          fill={accent}
          fillOpacity={pulse * 0.5}
        />
      );
    })}
  </svg>
);

// ─── Polka dots ───────────────────────────────────────────────────────────────
const DOT_POSITIONS = [
  { x: 80, y: 160, size: 28 }, { x: 960, y: 200, size: 20 },
  { x: 160, y: 1600, size: 24 }, { x: 900, y: 1700, size: 32 },
  { x: 60, y: 900, size: 18 }, { x: 1000, y: 950, size: 22 },
  { x: 200, y: 1200, size: 16 }, { x: 880, y: 1100, size: 26 },
];

const DotsBg: React.FC<{ frame: number }> = ({ frame }) => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    viewBox="0 0 1080 1920"
  >
    {DOT_POSITIONS.map((d, i) => (
      <circle
        key={i}
        cx={d.x + Math.sin(frame * 0.04 + i) * 5}
        cy={d.y + Math.cos(frame * 0.04 + i) * 5}
        r={d.size}
        fill="rgba(255,255,255,0.12)"
      />
    ))}
  </svg>
);
