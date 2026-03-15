import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { INTRO_END, QUESTION_END } from "../types";

interface Props {
  text: string;
  color?: string;
  shadow?: string;
  index?: number;
  total?: number;
}

export const QuestionText: React.FC<Props> = ({
  text,
  color = "#FFFFFF",
  shadow = "rgba(0,0,0,0.4)",
  index = 1,
  total = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    fps,
    frame: frame - INTRO_END,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(frame, [INTRO_END, INTRO_END + 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [60, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 220,
        left: 60,
        right: 60,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {total > 1 && (
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "sans-serif",
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: 2,
          }}
        >
          Question {index}/{total}
        </div>
      )}
      <div
        style={{
          fontSize: 72,
          color,
          fontFamily: "sans-serif",
          fontWeight: 900,
          lineHeight: 1.15,
          textShadow: `0 4px 20px ${shadow}`,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};
