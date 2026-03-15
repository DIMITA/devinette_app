import path from "path";
import os from "os";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { RenderProps, MultiRenderProps, VIDEO_FPS, TOTAL_FRAMES } from "./compositions/types";
import { generateAudioSegments, cleanupTTSDir, AudioSegments } from "./tts";

let bundled: string | null = null;

async function getBundle(): Promise<string> {
  if (bundled) return bundled;
  console.log("[renderer] Bundling Remotion compositions...");
  bundled = await bundle({
    entryPoint: path.join(__dirname, "Root.tsx"),
    webpackOverride: (config) => config,
  });
  console.log("[renderer] Bundle ready:", bundled);
  return bundled;
}

/** Convert a local file path to a localhost URL served by the Express server */
function fileToUrl(filePath: string, serverPort: number): string {
  // We encode the path and serve it via /tts-files route
  const encoded = encodeURIComponent(filePath);
  return `http://localhost:${serverPort}/tts-files?p=${encoded}`;
}

function segmentsToUrls(
  segments: AudioSegments,
  port: number
): { question?: string; reveal?: string; explanation?: string } {
  return {
    question: segments.question ? fileToUrl(segments.question, port) : undefined,
    reveal: segments.reveal ? fileToUrl(segments.reveal, port) : undefined,
    explanation: segments.explanation ? fileToUrl(segments.explanation, port) : undefined,
  };
}

// ─── Single question render ──────────────────────────────────────────────────

export interface SingleRenderJob {
  jobId: string;
  templateId: "Template1" | "Template2" | "Template3";
  props: RenderProps;
  outputDir?: string;
  serverPort?: number;
}

export interface RenderResult {
  outputPath: string;
  durationMs: number;
  sizeBytes: number;
}

export async function renderSingleVideo(job: SingleRenderJob): Promise<RenderResult> {
  const start = Date.now();
  const serveUrl = await getBundle();

  const outputDir = job.outputDir || path.join(os.tmpdir(), "devinettelab-renders");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${job.jobId}.mp4`);

  // Generate TTS audio
  let audioUrls: RenderProps["audioUrls"] | undefined;
  if (job.serverPort) {
    try {
      console.log(`[renderer] Generating TTS for job ${job.jobId}...`);
      const segments = await generateAudioSegments(
        job.props.question,
        job.jobId,
        "",
        job.props.lang || "fr"
      );
      audioUrls = segmentsToUrls(segments, job.serverPort);
      console.log(`[renderer] TTS ready for job ${job.jobId}`);
    } catch (err) {
      console.warn("[renderer] TTS generation failed, rendering without audio:", err);
    }
  }

  const inputProps: RenderProps = { ...job.props, audioUrls };

  const composition = await selectComposition({
    serveUrl,
    id: job.templateId,
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    pixelFormat: "yuv420p",
    crf: 18,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) console.log(`[renderer] Job ${job.jobId}: ${pct}%`);
    },
  });

  cleanupTTSDir(job.jobId);

  const stat = fs.statSync(outputPath);
  return { outputPath, durationMs: Date.now() - start, sizeBytes: stat.size };
}

// ─── Multi-question render ───────────────────────────────────────────────────

export interface MultiRenderJob {
  jobId: string;
  questions: MultiRenderProps["questions"];
  templateId: MultiRenderProps["templateId"];
  watermark?: string;
  lang?: string;
  outputDir?: string;
  serverPort?: number;
}

export async function renderMultiVideo(job: MultiRenderJob): Promise<RenderResult> {
  const start = Date.now();
  const serveUrl = await getBundle();

  const outputDir = job.outputDir || path.join(os.tmpdir(), "devinettelab-renders");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${job.jobId}.mp4`);
  const lang = job.lang || "fr";

  // Generate TTS for each question
  const audioUrlsArr: MultiRenderProps["audioUrls"] = [];
  if (job.serverPort) {
    for (let i = 0; i < job.questions.length; i++) {
      try {
        console.log(`[renderer] TTS Q${i + 1}/${job.questions.length} for job ${job.jobId}...`);
        const segments = await generateAudioSegments(
          job.questions[i],
          job.jobId,
          `q${i}`,
          lang
        );
        audioUrlsArr.push(segmentsToUrls(segments, job.serverPort));
      } catch (err) {
        console.warn(`[renderer] TTS Q${i + 1} failed:`, err);
        audioUrlsArr.push({});
      }
    }
  }

  const totalFrames = job.questions.length * TOTAL_FRAMES;
  const inputProps: MultiRenderProps = {
    questions: job.questions,
    templateId: job.templateId,
    watermark: job.watermark,
    lang,
    audioUrls: audioUrlsArr.length > 0 ? audioUrlsArr : undefined,
  };

  const composition = await selectComposition({
    serveUrl,
    id: "MultiQuestionVideo",
    inputProps,
  });

  // Override duration for dynamic composition
  const compositionWithDuration = { ...composition, durationInFrames: totalFrames };

  await renderMedia({
    composition: compositionWithDuration,
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    pixelFormat: "yuv420p",
    crf: 18,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) console.log(`[renderer] Multi job ${job.jobId}: ${pct}%`);
    },
  });

  cleanupTTSDir(job.jobId);

  const stat = fs.statSync(outputPath);
  return { outputPath, durationMs: Date.now() - start, sizeBytes: stat.size };
}
