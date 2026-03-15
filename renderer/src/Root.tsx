import React from "react";
import { Composition } from "remotion";
import { Template1 } from "./compositions/Template1";
import { Template2 } from "./compositions/Template2";
import { Template3 } from "./compositions/Template3";
import { VIDEO_FPS, VIDEO_WIDTH, VIDEO_HEIGHT, TOTAL_FRAMES, RenderProps } from "./compositions/types";

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

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
