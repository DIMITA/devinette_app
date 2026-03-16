/**
 * MultiQuestionVideo — enchaîne N questions dans une seule vidéo
 * Utilise <Sequence> pour jouer chaque question l'une après l'autre
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { MultiRenderProps, TOTAL_FRAMES } from "./types";
import { Template1 } from "./Template1";
import { Template2 } from "./Template2";
import { Template3 } from "./Template3";

export const MultiQuestionVideo: React.FC<MultiRenderProps> = ({
  questions,
  templateId,
  watermark,
  lang,
  audioUrls,
  framesPerQuestion,
}) => {
  const TemplateComp =
    templateId === "Template2" ? Template2 :
    templateId === "Template3" ? Template3 :
    Template1;

  // Compute cumulative start frame for each question
  const startFrames: number[] = [];
  let acc = 0;
  for (let i = 0; i < questions.length; i++) {
    startFrames.push(acc);
    acc += framesPerQuestion?.[i] ?? TOTAL_FRAMES;
  }

  return (
    <AbsoluteFill>
      {questions.map((q, i) => {
        const frames = framesPerQuestion?.[i] ?? TOTAL_FRAMES;
        return (
        <Sequence
          key={i}
          from={startFrames[i]}
          durationInFrames={frames}
          name={`Question ${i + 1}`}
        >
          <TemplateComp
            question={q}
            questionIndex={i + 1}
            totalQuestions={questions.length}
            showTimer={true}
            timerDuration={5}
            revealDelay={10}
            watermark={watermark}
            lang={lang}
            audioUrls={audioUrls?.[i]}
          />
        </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
