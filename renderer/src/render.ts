import path from "path";
import os from "os";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { RenderProps, VIDEO_FPS, VIDEO_WIDTH, VIDEO_HEIGHT, TOTAL_FRAMES } from "./compositions/types";

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

export interface RenderJob {
  jobId: string;
  templateId: "Template1" | "Template2" | "Template3";
  props: RenderProps;
  outputDir?: string;
}

export interface RenderResult {
  outputPath: string;
  durationMs: number;
  sizeBytes: number;
}

export async function renderVideo(job: RenderJob): Promise<RenderResult> {
  const start = Date.now();
  const serveUrl = await getBundle();

  const outputDir = job.outputDir || path.join(os.tmpdir(), "devinettelab-renders");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${job.jobId}.mp4`);

  const composition = await selectComposition({
    serveUrl,
    id: job.templateId,
    inputProps: job.props,
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: job.props,
    fps: VIDEO_FPS,
    pixelFormat: "yuv420p",
    crf: 18,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) console.log(`[renderer] Job ${job.jobId}: ${pct}%`);
    },
  });

  const stat = fs.statSync(outputPath);
  return {
    outputPath,
    durationMs: Date.now() - start,
    sizeBytes: stat.size,
  };
}
