import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { OPTIONS_END, TIMER_END } from "../types";

interface Props {
  color?: string;
  trackColor?: string;
}

export const TimerBar: React.FC<Props> = ({
  color = "#FF6B00",
  trackColor = "rgba(255,255,255,0.15)",
}) => {
  const frame = useCurrentFrame();

  const widthPercent = interpolate(
    frame,
    [OPTIONS_END, TIMER_END],
    [100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    frame,
    [OPTIONS_END - 5, OPTIONS_END + 5, TIMER_END - 5, TIMER_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Color shift as timer runs out
  const r = Math.round(interpolate(widthPercent, [0, 50, 100], [255, 255, 255]));
  const g = Math.round(interpolate(widthPercent, [0, 50, 100], [30, 107, 200]));
  const b = Math.round(interpolate(widthPercent, [0, 50, 100], [30, 0, 0]));
  const dynamicColor = `rgb(${r},${g},${b})`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 60,
        right: 60,
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 36,
          color: "rgba(255,255,255,0.6)",
          fontFamily: "sans-serif",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        ⏱ Réfléchis !
      </div>
      <div
        style={{
          height: 16,
          background: trackColor,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${widthPercent}%`,
            background: `linear-gradient(90deg, ${dynamicColor}, ${color})`,
            borderRadius: 8,
            boxShadow: `0 0 20px ${color}80`,
            transition: "width 0.05s linear",
          }}
        />
      </div>
    </div>
  );
};
