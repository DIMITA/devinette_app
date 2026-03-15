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
}) => {
  const TemplateComp =
    templateId === "Template2" ? Template2 :
    templateId === "Template3" ? Template3 :
    Template1;

  return (
    <AbsoluteFill>
      {questions.map((q, i) => (
        <Sequence
          key={i}
          from={i * TOTAL_FRAMES}
          durationInFrames={TOTAL_FRAMES}
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
      ))}
    </AbsoluteFill>
  );
};
