/**
 * Template 3 — Dark Gold Premium
 * Fond sombre avec accents dorés, style haut de gamme
 */
import React from "react";
import {
  AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig
} from "remotion";
import {
  RenderProps, INTRO_END, OUTRO_END, TIMER_END, OPTIONS_END, QUESTION_END
} from "./types";
import { TimerBar } from "./components/TimerBar";
import { AnswerReveal } from "./components/AnswerReveal";

const LABELS = ["A", "B", "C", "D"];

export const Template3: React.FC<RenderProps> = ({
  question,
  questionIndex,
  totalQuestions,
  watermark,
  audioUrls,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Outro fade — uses actual sequence duration so it never goes black early
  const outroOpacity = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const introProgress = spring({ fps, frame, config: { damping: 22, stiffness: 160 }, from: 0, to: 1 });
  const introOpacity = interpolate(introProgress, [0, 1], [0, 1]);

  const correctIndex = question.options
    ? question.options.findIndex(o => o === question.answer)
    : -1;

  // Question appear
  const qProgress = spring({ fps, frame: frame - INTRO_END, config: { damping: 18, stiffness: 120 } });
  const qOpacity = interpolate(frame, [INTRO_END, INTRO_END + 15], [0, 1], { extrapolateRight: "clamp" });
  const qScale = interpolate(qProgress, [0, 1], [0.92, 1]);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: outroOpacity * introOpacity,
      }}
    >
      {/* Deep dark background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 50%, #0D0D1A 100%)",
        }}
      />

      {/* Gold particle field */}
      <GoldParticles frame={frame} />

      {/* Top gold accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, transparent, #FFD700, #FF9500, #FFD700, transparent)",
        }}
      />

      {/* Brand */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ height: 2, flex: 1, maxWidth: 120, background: "linear-gradient(90deg, transparent, #FFD700)", marginLeft: 60 }} />
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: "#FFD700",
            fontFamily: "sans-serif",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          🏆 DevinetteLab
        </div>
        <div style={{ height: 2, flex: 1, maxWidth: 120, background: "linear-gradient(270deg, transparent, #FFD700)", marginRight: 60 }} />
      </div>

      {totalQuestions > 1 && (
        <div
          style={{
            position: "absolute",
            top: 90,
            right: 60,
            background: "rgba(255,215,0,0.15)",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: 50,
            padding: "10px 26px",
            fontSize: 32,
            fontWeight: 700,
            color: "#FFD700",
            fontFamily: "sans-serif",
          }}
        >
          {questionIndex}/{totalQuestions}
        </div>
      )}

      {/* Question */}
      <div
        style={{
          position: "absolute",
          top: 210,
          left: 60,
          right: 60,
          opacity: qOpacity,
          transform: `scale(${qScale})`,
        }}
      >
        {/* Gold decorative corners */}
        <GoldCorners />

        <div
          style={{
            padding: "56px 52px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 70,
              fontWeight: 900,
              color: "#FFFFFF",
              fontFamily: "sans-serif",
              lineHeight: 1.2,
              textShadow: "0 0 40px rgba(255,215,0,0.3), 0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            {question.question}
          </div>
        </div>
      </div>

      {/* Options */}
      {question.options && (
        <div
          style={{
            position: "absolute",
            top: 720,
            left: 60,
            right: 60,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {question.options.map((opt, i) => (
            <DarkOptionItem
              key={i}
              label={LABELS[i]}
              text={opt}
              index={i}
              isCorrect={i === correctIndex}
              frame={frame}
              fps={fps}
            />
          ))}
        </div>
      )}

      {/* Open answer */}
      {!question.options && frame >= TIMER_END && (
        <div
          style={{
            position: "absolute",
            top: 800,
            left: 60,
            right: 60,
            textAlign: "center",
            border: "2px solid rgba(255,215,0,0.5)",
            borderRadius: 24,
            padding: "48px 40px",
            background: "rgba(255,215,0,0.08)",
          }}
        >
          <div style={{ fontSize: 40, color: "#FFD700", fontFamily: "sans-serif", marginBottom: 20 }}>✅ Réponse</div>
          <div style={{ fontSize: 74, fontWeight: 900, color: "#FFFFFF", fontFamily: "sans-serif" }}>
            {question.answer}
          </div>
        </div>
      )}

      {/* Timer */}
      <TimerBar color="#FFD700" trackColor="rgba(255,215,0,0.1)" />

      {/* Explanation */}
      <AnswerReveal answer={question.answer} explanation={question.explanation} accentColor="#FFD700" />

      {/* Bottom gold line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent, #FFD700, #FF9500, #FFD700, transparent)",
        }}
      />

      {watermark && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 60,
            fontSize: 30,
            color: "rgba(255,215,0,0.5)",
            fontFamily: "sans-serif",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          @{watermark}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Dark-themed option item inline (better control for dark theme)
const DarkOptionItem: React.FC<{
  label: string; text: string; index: number;
  isCorrect: boolean; frame: number; fps: number;
}> = ({ label, text, index, isCorrect, frame, fps }) => {
  const STAGGER = 12;
  const entryStart = QUESTION_END + index * STAGGER;
  const TIMER_END_F = 330;

  const entryProgress = spring({ fps, frame: frame - entryStart, config: { damping: 15, stiffness: 100 } });
  const opacity = interpolate(frame, [entryStart, entryStart + 15], [0, 1], {
    extrapolateRight: "clamp", extrapolateLeft: "clamp",
  });
  const translateX = interpolate(entryProgress, [0, 1], [80, 0]);

  const isRevealed = frame >= TIMER_END_F;
  const revealProg = spring({ fps, frame: frame - TIMER_END_F, config: { damping: 20, stiffness: 150 } });
  const scale = isCorrect && isRevealed ? interpolate(revealProg, [0, 0.5, 1], [1, 1.05, 1]) : 1;

  const bg = isCorrect && isRevealed
    ? "rgba(255,215,0,0.2)"
    : "rgba(255,255,255,0.05)";
  const border = isCorrect && isRevealed
    ? "2px solid #FFD700"
    : "2px solid rgba(255,255,255,0.12)";

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        background: bg,
        border,
        borderRadius: 20,
        padding: "26px 36px",
        boxShadow: isCorrect && isRevealed ? "0 0 30px rgba(255,215,0,0.25)" : "none",
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 14,
          background: isCorrect && isRevealed ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.08)",
          border: isCorrect && isRevealed ? "2px solid #FFD700" : "2px solid rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          fontWeight: 900,
          color: isCorrect && isRevealed ? "#FFD700" : "rgba(255,255,255,0.7)",
          fontFamily: "sans-serif",
          flexShrink: 0,
        }}
      >
        {isCorrect && isRevealed ? "✓" : label}
      </div>
      <div
        style={{
          fontSize: 50,
          fontWeight: 700,
          color: isCorrect && isRevealed ? "#FFD700" : "#FFFFFF",
          fontFamily: "sans-serif",
          lineHeight: 1.2,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Import for DarkOptionItem
import { QUESTION_END } from "./types";

// Gold particle decorations
const GoldParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = [
    { x: 60, y: 180, size: 4 }, { x: 1020, y: 220, size: 3 },
    { x: 100, y: 600, size: 5 }, { x: 980, y: 550, size: 4 },
    { x: 80, y: 1400, size: 3 }, { x: 1000, y: 1450, size: 4 },
    { x: 150, y: 1700, size: 5 }, { x: 930, y: 1750, size: 3 },
    { x: 300, y: 120, size: 6 }, { x: 780, y: 130, size: 4 },
    { x: 200, y: 1900, size: 5 }, { x: 880, y: 1880, size: 4 },
  ];

  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1080 1920"
    >
      {particles.map((p, i) => {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + i * 0.8));
        return (
          <circle
            key={i}
            cx={p.x + Math.sin(frame * 0.03 + i) * 6}
            cy={p.y + Math.cos(frame * 0.03 + i) * 6}
            r={p.size * pulse}
            fill={`rgba(255, 215, 0, ${pulse * 0.6})`}
          />
        );
      })}
    </svg>
  );
};

// Decorative gold corner brackets
const GoldCorners: React.FC = () => (
  <>
    {/* Top-left */}
    <div style={{ position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTop: "3px solid #FFD700", borderLeft: "3px solid #FFD700", borderRadius: "8px 0 0 0" }} />
    {/* Top-right */}
    <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTop: "3px solid #FFD700", borderRight: "3px solid #FFD700", borderRadius: "0 8px 0 0" }} />
    {/* Bottom-left */}
    <div style={{ position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottom: "3px solid #FFD700", borderLeft: "3px solid #FFD700", borderRadius: "0 0 0 8px" }} />
    {/* Bottom-right */}
    <div style={{ position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottom: "3px solid #FFD700", borderRight: "3px solid #FFD700", borderRadius: "0 0 8px 0" }} />
  </>
);
