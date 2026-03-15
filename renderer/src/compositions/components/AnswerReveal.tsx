import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { TIMER_END, REVEAL_END, EXPLANATION_END } from "../types";

interface Props {
  answer: string;
  explanation?: string;
  accentColor?: string;
}

export const AnswerReveal: React.FC<Props> = ({
  answer,
  explanation,
  accentColor = "#FFD700",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Explanation reveal
  const explProgress = spring({
    fps,
    frame: frame - REVEAL_END,
    config: { damping: 18, stiffness: 120 },
  });

  const explOpacity = interpolate(frame, [REVEAL_END, REVEAL_END + 20], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  if (!explanation || frame < REVEAL_END) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 60,
        right: 60,
        opacity: explOpacity,
        transform: `translateY(${interpolate(explProgress, [0, 1], [40, 0])}px)`,
        background: "rgba(0,0,0,0.4)",
        border: `2px solid ${accentColor}40`,
        borderRadius: 24,
        padding: "32px 40px",
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: accentColor,
          fontFamily: "sans-serif",
          marginBottom: 12,
        }}
      >
        💡 Le savais-tu ?
      </div>
      <div
        style={{
          fontSize: 46,
          color: "rgba(255,255,255,0.9)",
          fontFamily: "sans-serif",
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {explanation}
      </div>
    </div>
  );
};
