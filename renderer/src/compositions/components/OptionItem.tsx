import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { OPTIONS_END, QUESTION_END, REVEAL_END, TIMER_END } from "../types";

interface Props {
  label: string;
  text: string;
  index: number;
  isCorrect: boolean;
  bgColor?: string;
  correctColor?: string;
  labelBg?: string;
}

const STAGGER = 12; // frames between each option

export const OptionItem: React.FC<Props> = ({
  label,
  text,
  index,
  isCorrect,
  bgColor = "rgba(255,255,255,0.15)",
  correctColor = "#00E676",
  labelBg = "rgba(255,255,255,0.25)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryStart = QUESTION_END + index * STAGGER;

  const entryProgress = spring({
    fps,
    frame: frame - entryStart,
    config: { damping: 15, stiffness: 100, mass: 0.9 },
  });

  const opacity = interpolate(frame, [entryStart, entryStart + 15], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  const translateX = interpolate(entryProgress, [0, 1], [-80, 0]);

  // Reveal animation
  const revealProgress = spring({
    fps,
    frame: frame - TIMER_END,
    config: { damping: 20, stiffness: 150 },
  });
  const isRevealed = frame >= TIMER_END;

  const scale = isCorrect && isRevealed
    ? interpolate(revealProgress, [0, 0.5, 1], [1, 1.06, 1])
    : 1;

  const currentBg = isCorrect && isRevealed
    ? correctColor
    : bgColor;

  const borderColor = isCorrect && isRevealed
    ? correctColor
    : "rgba(255,255,255,0.2)";

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        background: currentBg,
        border: `3px solid ${borderColor}`,
        borderRadius: 24,
        padding: "28px 36px",
        transition: "background 0.3s",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 16,
          background: isCorrect && isRevealed ? "rgba(0,0,0,0.2)" : labelBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 900,
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          flexShrink: 0,
        }}
      >
        {isCorrect && isRevealed ? "✓" : label}
      </div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          lineHeight: 1.2,
        }}
      >
        {text}
      </div>
    </div>
  );
};
