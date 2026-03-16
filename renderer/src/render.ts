import path from "path";
import os from "os";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { RenderProps, MultiRenderProps } from "./compositions/types";
import { generateAudioFiles, cleanupTTSDir } from "./tts";
import {
  buildAudioEntries, buildMultiAudioEntries, calcMinFrames, mixAudioIntoVideo
} from "./ffmpeg-mix";

let bundled: string | null = null;

async function getBundle(): Promise<string> {
  if (bundled) return bundled;
  console.log("[renderer] Bundling Remotion compositions...");
  bundled = await bundle({
    entryPoint: path.join(__dirname, "Root.tsx"),
    webpackOverride: (config) => config,
  });
  console.log("[renderer] Bundle ready");
  return bundled;
}

function renderDir(): string {
  const dir = path.join(os.tmpdir(), "devinettelab-renders");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export interface RenderResult {
  outputPath: string;
  durationMs: number;
  sizeBytes: number;
}

// ─── Single question ──────────────────────────────────────────────────────────

export interface SingleRenderJob {
  jobId: string;
  templateId: "Template1" | "Template2" | "Template3";
  props: RenderProps;
  outputDir?: string;
  onProgress?: (pct: number) => void;
}

export async function renderSingleVideo(job: SingleRenderJob): Promise<RenderResult> {
  const start = Date.now();
  const serveUrl = await getBundle();
  const outDir = job.outputDir || renderDir();

  // Step 1: Render silent video with Remotion
  const silentPath = path.join(outDir, `${job.jobId}-silent.mp4`);
  const finalPath  = path.join(outDir, `${job.jobId}.mp4`);

  const composition = await selectComposition({
    serveUrl,
    id: job.templateId,
    inputProps: job.props,
  });

  console.log(`[renderer] Rendering ${job.templateId} (silent)...`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: silentPath,
    inputProps: job.props,
    pixelFormat: "yuv420p",
    crf: 18,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      // Remotion render = 15–88%
      job.onProgress?.(15 + Math.round(pct * 0.73));
      if (pct % 20 === 0) console.log(`[renderer] Video ${job.jobId}: ${pct}%`);
    },
  });

  job.onProgress?.(5);

  // Step 2: Generate TTS audio
  const lang = (job.props.lang as string) || "fr";
  console.log(`[renderer] Generating TTS (lang: ${lang})...`);
  const audioFiles = await generateAudioFiles(job.props.question, job.jobId, "", lang);
  job.onProgress?.(15);

  // Step 3: FFMPEG mix audio into video
  const entries = buildAudioEntries(audioFiles, 0);
  job.onProgress?.(90);
  await mixAudioIntoVideo(silentPath, entries, finalPath);
  job.onProgress?.(98);

  // Cleanup
  if (fs.existsSync(silentPath)) fs.unlinkSync(silentPath);
  cleanupTTSDir(job.jobId);

  const stat = fs.statSync(finalPath);
  return { outputPath: finalPath, durationMs: Date.now() - start, sizeBytes: stat.size };
}

// ─── Multi-question ───────────────────────────────────────────────────────────

export interface MultiRenderJob {
  jobId: string;
  questions: MultiRenderProps["questions"];
  templateId: MultiRenderProps["templateId"];
  watermark?: string;
  lang?: string;
  colorScheme?: string;
  bgPattern?: string;
  outputDir?: string;
  onProgress?: (pct: number) => void;
}

export async function renderMultiVideo(job: MultiRenderJob): Promise<RenderResult> {
  const start = Date.now();
  const serveUrl = await getBundle();
  const outDir = job.outputDir || renderDir();
  const lang = job.lang || "fr";

  const silentPath = path.join(outDir, `${job.jobId}-silent.mp4`);
  const finalPath  = path.join(outDir, `${job.jobId}.mp4`);

  const inputProps: MultiRenderProps = {
    questions: job.questions,
    templateId: job.templateId,
    watermark: job.watermark,
    lang,
    colorScheme: job.colorScheme,
    bgPattern: job.bgPattern,
  };

  // Step 1: Generate TTS for ALL questions first so we can measure audio durations
  const allFiles = [];
  for (let i = 0; i < job.questions.length; i++) {
    console.log(`[renderer] TTS Q${i + 1}/${job.questions.length}...`);
    const files = await generateAudioFiles(job.questions[i], job.jobId, `q${i}`, lang);
    allFiles.push(files);
    // TTS generation = 0-15%
    job.onProgress?.(Math.round(((i + 1) / job.questions.length) * 15));
  }

  // Step 2: Calculate per-question frame counts based on actual audio lengths
  console.log("[renderer] Calculating per-question durations...");
  const framesPerQuestion: number[] = await Promise.all(
    allFiles.map((files) => calcMinFrames(files))
  );
  const totalFrames = framesPerQuestion.reduce((a, b) => a + b, 0);
  console.log(`[renderer] Per-question frames: ${framesPerQuestion.join(", ")} (total: ${totalFrames})`);

  // Step 3: Render Remotion video with dynamic timing
  const propsWithFrames: MultiRenderProps = { ...inputProps, framesPerQuestion };
  const composition = await selectComposition({
    serveUrl,
    id: "MultiQuestionVideo",
    inputProps: propsWithFrames,
  });

  console.log(`[renderer] Rendering MultiQuestionVideo (${job.questions.length}q, silent)...`);
  await renderMedia({
    composition: { ...composition, durationInFrames: totalFrames },
    serveUrl,
    codec: "h264",
    outputLocation: silentPath,
    inputProps: propsWithFrames,
    pixelFormat: "yuv420p",
    crf: 18,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      // Remotion render = 20-88%
      job.onProgress?.(20 + Math.round(pct * 0.68));
      if (pct % 20 === 0) console.log(`[renderer] Multi ${job.jobId}: ${pct}%`);
    },
  });

  // Step 4: Build audio entries using cumulative per-question offsets, then mix
  job.onProgress?.(90);
  const allEntries = buildMultiAudioEntries(allFiles, framesPerQuestion);
  await mixAudioIntoVideo(silentPath, allEntries, finalPath);
  job.onProgress?.(98);

  // Cleanup
  if (fs.existsSync(silentPath)) fs.unlinkSync(silentPath);
  cleanupTTSDir(job.jobId);

  const stat = fs.statSync(finalPath);
  return { outputPath: finalPath, durationMs: Date.now() - start, sizeBytes: stat.size };
}
