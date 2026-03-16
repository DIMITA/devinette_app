/**
 * Template 2 — Orange + Personnage (style quiz_culture03)
 * Avatar SVG animé en bas, bulles de dialogue, fond orange dynamique
 */
import React from "react";
import {
  AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence
} from "remotion";
import {
  RenderProps, INTRO_END, OUTRO_END, TIMER_END, OPTIONS_END, QUESTION_END
} from "./types";
import { OptionItem } from "./components/OptionItem";
import { TimerBar } from "./components/TimerBar";
import { AnswerReveal } from "./components/AnswerReveal";

const LABELS = ["A", "B", "C", "D"];

export const Template2: React.FC<RenderProps> = ({
  question,
  questionIndex,
  totalQuestions,
  watermark,
  audioUrls,
  sequenceDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const outroEnd = sequenceDuration ?? OUTRO_END;
  const outroOpacity = interpolate(frame, [outroEnd - 20, outroEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const introScale = spring({ fps, frame, config: { damping: 18, stiffness: 180 }, from: 0.9, to: 1 });

  const correctIndex = question.options
    ? question.options.findIndex(o => o === question.answer)
    : -1;

  // Avatar bounce
  const avatarBounce = Math.sin(frame * 0.12) * 8;
  const avatarTail = Math.sin(frame * 0.18) * 15;

  // Question bubble slide
  const bubbleProgress = spring({ fps, frame: frame - INTRO_END, config: { damping: 16, stiffness: 110 } });
  const bubbleTranslate = interpolate(bubbleProgress, [0, 1], [-60, 0]);
  const bubbleOpacity = interpolate(frame, [INTRO_END, INTRO_END + 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: outroOpacity,
        transform: frame < INTRO_END ? `scale(${introScale})` : "scale(1)",
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #FF9B40 0%, #FF6B00 45%, #CC4400 100%)",
        }}
      />

      {/* Animated polka dots */}
      <PolkaDotBg frame={frame} />

      {/* Brand */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 48,
          fontWeight: 900,
          color: "rgba(255,255,255,0.95)",
          fontFamily: "sans-serif",
          letterSpacing: -1,
          textShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        🎯 DEVINETTE
      </div>

      {totalQuestions > 1 && (
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 60,
            background: "rgba(0,0,0,0.25)",
            borderRadius: 50,
            padding: "10px 26px",
            fontSize: 34,
            fontWeight: 800,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "sans-serif",
          }}
        >
          {questionIndex}/{totalQuestions}
        </div>
      )}

      {/* Question speech bubble */}
      <div
        style={{
          position: "absolute",
          top: 185,
          left: 50,
          right: 50,
          opacity: bubbleOpacity,
          transform: `translateY(${bubbleTranslate}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 36,
            padding: "44px 48px",
            position: "relative",
            boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              fontSize: 66,
              fontWeight: 900,
              color: "#1A1A2E",
              fontFamily: "sans-serif",
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            {question.question}
          </div>
          {/* Bubble tail */}
          <div
            style={{
              position: "absolute",
              bottom: -36,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "28px solid transparent",
              borderRight: "28px solid transparent",
              borderTop: "40px solid rgba(255,255,255,0.95)",
            }}
          />
        </div>
      </div>

      {/* Options grid */}
      {question.options && (
        <div
          style={{
            position: "absolute",
            top: 760,
            left: 50,
            right: 50,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {question.options.map((opt, i) => (
            <OptionItem
              key={i}
              label={LABELS[i]}
              text={opt}
              index={i}
              isCorrect={i === correctIndex}
              bgColor="rgba(255,255,255,0.18)"
              correctColor="#00E676"
              labelBg="rgba(255,255,255,0.3)"
            />
          ))}
        </div>
      )}

      {/* Timer */}
      <TimerBar color="#FFFFFF" trackColor="rgba(0,0,0,0.2)" />

      {/* Explanation */}
      <AnswerReveal answer={question.answer} explanation={question.explanation} accentColor="#FFD700" />

      {/* Animated avatar */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: `translateX(-50%) translateY(${avatarBounce}px)`,
        }}
      >
        <AvatarCharacter tailAngle={avatarTail} />
      </div>

      {watermark && (
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 60,
            fontSize: 30,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "sans-serif",
            fontWeight: 700,
          }}
        >
          @{watermark}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Simple SVG avatar character
const AvatarCharacter: React.FC<{ tailAngle: number }> = ({ tailAngle }) => (
  <svg width="180" height="200" viewBox="0 0 180 200" fill="none">
    {/* Body */}
    <ellipse cx="90" cy="130" rx="55" ry="65" fill="#FFD700" />
    {/* Head */}
    <circle cx="90" cy="70" r="52" fill="#FFD700" />
    {/* Eyes */}
    <circle cx="72" cy="65" r="10" fill="#1A1A2E" />
    <circle cx="108" cy="65" r="10" fill="#1A1A2E" />
    <circle cx="75" cy="62" r="4" fill="white" />
    <circle cx="111" cy="62" r="4" fill="white" />
    {/* Smile */}
    <path d="M 68 85 Q 90 100 112 85" stroke="#1A1A2E" strokeWidth="5" fill="none" strokeLinecap="round" />
    {/* Arms */}
    <ellipse cx="28" cy="140" rx="18" ry="30" fill="#FFD700" transform={`rotate(-20, 28, 140)`} />
    <ellipse cx="152" cy="140" rx="18" ry="30" fill="#FFD700" transform={`rotate(20, 152, 140)`} />
    {/* Legs */}
    <ellipse cx="70" cy="190" rx="22" ry="15" fill="#FF8C38" />
    <ellipse cx="110" cy="190" rx="22" ry="15" fill="#FF8C38" />
    {/* Star on belly */}
    <text x="78" y="145" fontSize="36">⭐</text>
  </svg>
);

// Polka dot decorative background
const PolkaDotBg: React.FC<{ frame: number }> = ({ frame }) => {
  const dots = [
    { x: 80, y: 160, size: 28 }, { x: 960, y: 200, size: 20 },
    { x: 160, y: 1600, size: 24 }, { x: 900, y: 1700, size: 32 },
    { x: 60, y: 900, size: 18 }, { x: 1000, y: 950, size: 22 },
    { x: 200, y: 1200, size: 16 }, { x: 880, y: 1100, size: 26 },
  ];
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      viewBox="0 0 1080 1920"
    >
      {dots.map((d, i) => (
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
};
