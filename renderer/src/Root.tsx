import React from "react";
import { Composition, registerRoot } from "remotion";
import { Template1 } from "./compositions/Template1";
import { Template2 } from "./compositions/Template2";
import { Template3 } from "./compositions/Template3";
import { MultiQuestionVideo } from "./compositions/MultiQuestionVideo";
import {
  VIDEO_FPS, VIDEO_WIDTH, VIDEO_HEIGHT, TOTAL_FRAMES,
  RenderProps, MultiRenderProps,
} from "./compositions/types";

const defaultProps: RenderProps = {
  question: {
    question: "Quelle est la capitale de la France ? 🇫🇷",
    options: ["Berlin", "Paris", "Madrid", "Rome"],
    answer: "Paris",
    explanation: "Paris est la capitale de la France depuis plus de 10 siècles !",
    difficulty: "easy",
  },
  questionIndex: 1,
  totalQuestions: 1,
  showTimer: true,
  timerDuration: 5,
  revealDelay: 10,
  watermark: "devinettelab",
};

const defaultMultiProps: MultiRenderProps = {
  questions: [
    {
      question: "Quelle est la capitale de la France ?",
      options: ["Berlin", "Paris", "Madrid", "Rome"],
      answer: "Paris",
      explanation: "Paris est la capitale depuis plus de 10 siècles !",
    },
    {
      question: "Combien de côtés a un hexagone ?",
      options: ["4", "5", "6", "8"],
      answer: "6",
      explanation: "Hexa = 6 en grec !",
    },
    {
      question: "Qui a peint la Joconde ?",
      options: ["Raphaël", "Michel-Ange", "Léonard de Vinci", "Botticelli"],
      answer: "Léonard de Vinci",
      explanation: "La Joconde a été peinte vers 1503 par Léonard de Vinci.",
    },
  ],
  templateId: "Template1",
  watermark: "devinettelab",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Single-question templates */}
      <Composition
        id="Template1"
        component={Template1}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultProps}
      />
      <Composition
        id="Template2"
        component={Template2}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultProps}
      />
      <Composition
        id="Template3"
        component={Template3}
        durationInFrames={TOTAL_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultProps}
      />

      {/* Multi-question chained video (dynamic duration) */}
      <Composition
        id="MultiQuestionVideo"
        component={MultiQuestionVideo}
        calculateMetadata={({ props }) => ({
          durationInFrames: (props.questions?.length || 1) * TOTAL_FRAMES,
          fps: VIDEO_FPS,
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
        })}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        durationInFrames={defaultMultiProps.questions.length * TOTAL_FRAMES}
        defaultProps={defaultMultiProps}
      />
    </>
  );
};

registerRoot(RemotionRoot);
