/**
 * Template 3 — Dark Premium
 * Fond sombre avec accents colorés, style haut de gamme
 */
import React from "react";
import {
  AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig
} from "remotion";
import {
  RenderProps, INTRO_END, OUTRO_END, TIMER_END, OPTIONS_END, QUESTION_END
} from "./types";
import { BgDecoration } from "./components/BgDecoration";
import { getColorScheme } from "./themes";
import { TimerBar } from "./components/TimerBar";
import { AnswerReveal } from "./components/AnswerReveal";

const LABELS = ["A", "B", "C", "D"];

export const Template3: React.FC<RenderProps> = ({
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
  const scheme = getColorScheme(colorScheme ?? "gold");
  const outroEnd = sequenceDuration ?? OUTRO_END;

  const outroOpacity = interpolate(frame, [outroEnd - 20, outroEnd], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const introProgress = spring({ fps, frame, config: { damping: 22, stiffness: 160 }, from: 0, to: 1 });
  const introOpacity = interpolate(introProgress, [0, 1], [0, 1]);

  const correctIndex = question.options
    ? question.options.findIndex(o => o === question.answer)
    : -1;

  const qProgress = spring({ fps, frame: frame - INTRO_END, config: { damping: 18, stiffness: 120 } });
  const qOpacity = interpolate(frame, [INTRO_END, INTRO_END + 15], [0, 1], { extrapolateRight: "clamp" });
  const qScale = interpolate(qProgress, [0, 1], [0.92, 1]);

  const ac = scheme.accent;

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: outroOpacity * introOpacity }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, background: scheme.bg }} />
      <BgDecoration pattern={bgPattern ?? "particles"} accent={ac} />

      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, transparent, ${ac}, transparent)` }} />

      {/* Brand */}
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
        <div style={{ height: 2, flex: 1, maxWidth: 120, background: `linear-gradient(90deg, transparent, ${ac})`, marginLeft: 60 }} />
        <div style={{ fontSize: 42, fontWeight: 900, color: ac, fontFamily: "sans-serif", letterSpacing: 3, textTransform: "uppercase" }}>
          🏆 DevinetteLab
        </div>
        <div style={{ height: 2, flex: 1, maxWidth: 120, background: `linear-gradient(270deg, transparent, ${ac})`, marginRight: 60 }} />
      </div>

      {totalQuestions > 1 && (
        <div style={{ position: "absolute", top: 90, right: 60, background: `${ac}26`, border: `1px solid ${ac}4D`, borderRadius: 50, padding: "10px 26px", fontSize: 32, fontWeight: 700, color: ac, fontFamily: "sans-serif" }}>
          {questionIndex}/{totalQuestions}
        </div>
      )}

      {/* Question box */}
      <div style={{ position: "absolute", top: 210, left: 60, right: 60, opacity: qOpacity, transform: `scale(${qScale})` }}>
        <AccentCorners accent={ac} />
        <div style={{ padding: "56px 52px", textAlign: "center" }}>
          <div style={{ fontSize: 70, fontWeight: 900, color: "#FFFFFF", fontFamily: "sans-serif", lineHeight: 1.2, textShadow: `0 0 40px ${ac}4D, 0 4px 16px rgba(0,0,0,0.6)` }}>
            {question.question}
          </div>
        </div>
      </div>

      {/* Options */}
      {question.options && (
        <div style={{ position: "absolute", top: 720, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 20 }}>
          {question.options.map((opt, i) => (
            <DarkOptionItem key={i} label={LABELS[i]} text={opt} index={i} isCorrect={i === correctIndex} frame={frame} fps={fps} accent={ac} />
          ))}
        </div>
      )}

      {/* Open answer */}
      {!question.options && frame >= TIMER_END && (
        <div style={{ position: "absolute", top: 800, left: 60, right: 60, textAlign: "center", border: `2px solid ${ac}80`, borderRadius: 24, padding: "48px 40px", background: `${ac}14` }}>
          <div style={{ fontSize: 40, color: ac, fontFamily: "sans-serif", marginBottom: 20 }}>✅ Réponse</div>
          <div style={{ fontSize: 74, fontWeight: 900, color: "#FFFFFF", fontFamily: "sans-serif" }}>{question.answer}</div>
        </div>
      )}

      <TimerBar color={ac} trackColor={`${ac}1A`} />
      <AnswerReveal answer={question.answer} explanation={question.explanation} accentColor={ac} />

      {/* Bottom accent line */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${ac}, transparent)` }} />

      {watermark && (
        <div style={{ position: "absolute", bottom: 24, right: 60, fontSize: 30, color: `${ac}80`, fontFamily: "sans-serif", fontWeight: 700, letterSpacing: 1 }}>
          @{watermark}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const DarkOptionItem: React.FC<{
  label: string; text: string; index: number;
  isCorrect: boolean; frame: number; fps: number; accent: string;
}> = ({ label, text, index, isCorrect, frame, fps, accent }) => {
  const entryStart = QUESTION_END + index * 12;
  const entryProgress = spring({ fps, frame: frame - entryStart, config: { damping: 15, stiffness: 100 } });
  const opacity = interpolate(frame, [entryStart, entryStart + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const translateX = interpolate(entryProgress, [0, 1], [80, 0]);

  const isRevealed = frame >= 330;
  const revealProg = spring({ fps, frame: frame - 330, config: { damping: 20, stiffness: 150 } });
  const scale = isCorrect && isRevealed ? interpolate(revealProg, [0, 0.5, 1], [1, 1.05, 1]) : 1;

  return (
    <div style={{
      opacity, transform: `translateX(${translateX}px) scale(${scale})`,
      display: "flex", alignItems: "center", gap: 24,
      background: isCorrect && isRevealed ? `${accent}33` : "rgba(255,255,255,0.05)",
      border: isCorrect && isRevealed ? `2px solid ${accent}` : "2px solid rgba(255,255,255,0.12)",
      borderRadius: 20, padding: "26px 36px",
      boxShadow: isCorrect && isRevealed ? `0 0 30px ${accent}40` : "none",
    }}>
      <div style={{
        width: 68, height: 68, borderRadius: 14, flexShrink: 0,
        background: isCorrect && isRevealed ? `${accent}33` : "rgba(255,255,255,0.08)",
        border: isCorrect && isRevealed ? `2px solid ${accent}` : "2px solid rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 36, fontWeight: 900,
        color: isCorrect && isRevealed ? accent : "rgba(255,255,255,0.7)",
        fontFamily: "sans-serif",
      }}>
        {isCorrect && isRevealed ? "✓" : label}
      </div>
      <div style={{ fontSize: 50, fontWeight: 700, color: isCorrect && isRevealed ? accent : "#FFFFFF", fontFamily: "sans-serif", lineHeight: 1.2 }}>
        {text}
      </div>
    </div>
  );
};

const AccentCorners: React.FC<{ accent: string }> = ({ accent }) => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTop: `3px solid ${accent}`, borderLeft: `3px solid ${accent}`, borderRadius: "8px 0 0 0" }} />
    <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTop: `3px solid ${accent}`, borderRight: `3px solid ${accent}`, borderRadius: "0 8px 0 0" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottom: `3px solid ${accent}`, borderLeft: `3px solid ${accent}`, borderRadius: "0 0 0 8px" }} />
    <div style={{ position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottom: `3px solid ${accent}`, borderRight: `3px solid ${accent}`, borderRadius: "0 0 8px 0" }} />
  </>
);
