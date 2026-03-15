import React from "react";
import { Audio, Sequence } from "remotion";
import { AudioUrls, INTRO_END, TIMER_END, REVEAL_END } from "../types";

interface Props {
  audioUrls?: AudioUrls;
}

/**
 * Synchronized audio tracks for the quiz timeline.
 * - Question is read when it appears (frame INTRO_END + 5)
 * - Reveal is read when the answer is shown (TIMER_END + 5)
 * - Explanation is read when the explanation appears (REVEAL_END + 5)
 */
export const AudioTrack: React.FC<Props> = ({ audioUrls }) => {
  if (!audioUrls) return null;

  return (
    <>
      {audioUrls.question && (
        <Sequence from={INTRO_END + 5}>
          <Audio src={audioUrls.question} volume={1} />
        </Sequence>
      )}
      {audioUrls.reveal && (
        <Sequence from={TIMER_END + 5}>
          <Audio src={audioUrls.reveal} volume={1} />
        </Sequence>
      )}
      {audioUrls.explanation && (
        <Sequence from={REVEAL_END + 5}>
          <Audio src={audioUrls.explanation} volume={0.9} />
        </Sequence>
      )}
    </>
  );
};
