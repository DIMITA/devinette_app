/**
 * Template 1 — Orange Minimal
 * Fond orange vif, texte animé, style épuré haute performance
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { RenderProps, VIDEO_WIDTH, VIDEO_HEIGHT, INTRO_END, OUTRO_END, TIMER_END, OPTIONS_END, TOTAL_FRAMES } from "./types";
import { QuestionText } from "./components/QuestionText";
import { OptionItem } from "./components/OptionItem";
import { TimerBar } from "./components/TimerBar";
import { AnswerReveal } from "./components/AnswerReveal";
import { BgDecoration } from "./components/BgDecoration";
import { getColorScheme } from "./themes";

const LABELS = ["A", "B", "C", "D"];

export const Template1: React.FC<RenderProps> = ({
  question,
  questionIndex,
  totalQuestions,
  watermark,
  audioUrls,
  sequenceDuration,
  colorScheme,
  bgPattern,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scheme = getColorScheme(colorScheme);
  const outroEnd = sequenceDuration ?? OUTRO_END;

  const introScale = spring({ fps, frame, config: { damping: 20, stiffness: 200 }, from: 0.85, to: 1 });
  const outroOpacity = interpolate(frame, [outroEnd - 20, outroEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const correctIndex = question.options
    ? question.options.findIndex(o => o === question.answer)
    : -1;

  return (
    <AbsoluteFill
      style={{
        background: scheme.bg,
        opacity: outroOpacity,
        transform: frame < INTRO_END ? `scale(${introScale})` : "scale(1)",
        overflow: "hidden",
      }}
    >
      <BgDecoration pattern={bgPattern ?? "rays"} accent={scheme.accent} />

      {/* Top brand bar */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "sans-serif",
            letterSpacing: -1,
          }}
        >
          🎯 DevinetteLab
        </div>
        {totalQuestions > 1 && (
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: 50,
              padding: "10px 24px",
              fontSize: 36,
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "sans-serif",
            }}
          >
            {questionIndex}/{totalQuestions}
          </div>
        )}
      </div>

      {/* Question */}
      <QuestionText text={question.question} color="#FFFFFF" shadow="rgba(0,0,0,0.3)" />

      {/* Options */}
      {question.options && (
        <div
          style={{
            position: "absolute",
            top: 620,
            left: 60,
            right: 60,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {question.options.map((opt, i) => (
            <OptionItem
              key={i}
              label={LABELS[i]}
              text={opt}
              index={i}
              isCorrect={i === correctIndex}
              bgColor={scheme.optionBg}
              correctColor={scheme.accent}
              labelBg={scheme.labelBg}
            />
          ))}
        </div>
      )}

      {/* Open answer */}
      {!question.options && frame >= TIMER_END && (
        <div
          style={{
            position: "absolute",
            top: 700,
            left: 60,
            right: 60,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 24,
            padding: "40px 48px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 44, color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif", marginBottom: 16 }}>
            ✅ Réponse
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: "#FFFFFF", fontFamily: "sans-serif" }}>
            {question.answer}
          </div>
        </div>
      )}

      {/* Timer */}
      <TimerBar color="#FFFFFF" trackColor="rgba(0,0,0,0.25)" />

      {/* Explanation */}
      <AnswerReveal
        answer={question.answer}
        explanation={question.explanation}
        accentColor={scheme.accent}
      />

      {/* Watermark */}
      {watermark && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 60,
            fontSize: 32,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "sans-serif",
            fontWeight: 600,
          }}
        >
          @{watermark}
        </div>
      )}
    </AbsoluteFill>
  );
};

