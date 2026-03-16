import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { getAudioDurationMs, AudioFiles } from "./tts";

// Timeline constants (frames at 30fps)
const FPS = 30;
const INTRO_END = 30;    // frame 30  → 1.0s
const TIMER_END = 330;   // frame 330 → 11.0s
const REVEAL_END = 420;  // frame 420 → 14.0s
const TOTAL_FRAMES = 540; // 18s per question

function frameToMs(frame: number): number {
  return Math.round((frame / FPS) * 1000);
}

// Audio cue offsets within a single question (in ms)
const QUESTION_CUE_MS = frameToMs(INTRO_END + 10); // ≈ 1333ms
const REVEAL_CUE_MS   = frameToMs(TIMER_END + 8);  // ≈ 11267ms
const EXPLAIN_CUE_MS  = frameToMs(REVEAL_END + 8); // ≈ 14267ms

export interface AudioEntry {
  path: string;
  startMs: number;
}

/** Build the list of audio entries for one question at a given video offset. */
export function buildAudioEntries(
  files: { question?: string; reveal?: string; explanation?: string },
  questionStartMs: number = 0
): AudioEntry[] {
  const entries: AudioEntry[] = [];
  if (files.question) {
    entries.push({ path: files.question, startMs: questionStartMs + QUESTION_CUE_MS });
  }
  if (files.reveal) {
    entries.push({ path: files.reveal, startMs: questionStartMs + REVEAL_CUE_MS });
  }
  if (files.explanation) {
    entries.push({ path: files.explanation, startMs: questionStartMs + EXPLAIN_CUE_MS });
  }
  return entries;
}

/** @deprecated Use buildMultiAudioEntries for multi-question videos */
export function questionStartMs(index: number): number {
  return frameToMs(index * TOTAL_FRAMES);
}

/**
 * Returns the minimum frame count needed for one question slot,
 * so that all TTS audio (question, reveal, explanation) finishes
 * before the next question starts. Adds a 600ms safety buffer.
 */
export async function calcMinFrames(files: AudioFiles): Promise<number> {
  const BUFFER_MS = 600;
  let minEndMs = frameToMs(TOTAL_FRAMES); // floor = default 18s

  if (files.explanation) {
    const dur = await getAudioDurationMs(files.explanation);
    minEndMs = Math.max(minEndMs, EXPLAIN_CUE_MS + dur + BUFFER_MS);
  }
  if (files.reveal) {
    const dur = await getAudioDurationMs(files.reveal);
    minEndMs = Math.max(minEndMs, REVEAL_CUE_MS + dur + BUFFER_MS);
  }
  if (files.question) {
    const dur = await getAudioDurationMs(files.question);
    // Question audio should finish before the timer — if it overflows
    // past REVEAL_CUE_MS it would overlap reveal; cap at that boundary.
    minEndMs = Math.max(minEndMs, QUESTION_CUE_MS + dur + BUFFER_MS);
  }

  return Math.ceil((minEndMs / 1000) * FPS);
}

/**
 * Build audio entries for all questions using their actual per-question
 * frame counts (which may differ from TOTAL_FRAMES).
 */
export function buildMultiAudioEntries(
  allFiles: AudioFiles[],
  framesPerQuestion: number[]
): AudioEntry[] {
  const entries: AudioEntry[] = [];
  let cumulativeMs = 0;
  for (let i = 0; i < allFiles.length; i++) {
    entries.push(...buildAudioEntries(allFiles[i], cumulativeMs));
    cumulativeMs += frameToMs(framesPerQuestion[i]);
  }
  return entries;
}

/**
 * Mix audio tracks into a silent video using FFMPEG.
 * Falls back to copying the video untouched if no audio is provided or FFMPEG fails.
 */
export async function mixAudioIntoVideo(
  videoPath: string,
  entries: AudioEntry[],
  outputPath: string
): Promise<void> {
  const valid = entries.filter(e => fs.existsSync(e.path));

  if (valid.length === 0) {
    console.warn("[ffmpeg] No audio files found, outputting silent video");
    fs.copyFileSync(videoPath, outputPath);
    return;
  }

  return new Promise((resolve, reject) => {
    const args: string[] = ["-y", "-i", videoPath];

    // Append each audio input
    for (const entry of valid) {
      args.push("-i", entry.path);
    }

    // Build filter_complex
    const delays: string[] = [];
    const labels: string[] = [];
    valid.forEach((entry, i) => {
      const label = `a${i}`;
      delays.push(`[${i + 1}:a]adelay=${entry.startMs}|${entry.startMs}[${label}]`);
      labels.push(`[${label}]`);
    });
    const filterGraph =
      delays.join(";") +
      ";" +
      `${labels.join("")}amix=inputs=${valid.length}:normalize=0:dropout_transition=0[aout]`;

    args.push(
      "-filter_complex", filterGraph,
      "-map", "0:v",
      "-map", "[aout]",
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "128k",
      "-ar", "44100",
      "-shortest",
      outputPath
    );

    console.log(`[ffmpeg] Mixing ${valid.length} audio tracks into video...`);

    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });

    let stderr = "";
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log("[ffmpeg] Mix done ✓");
        resolve();
      } else {
        console.error("[ffmpeg] Error output:\n", stderr.slice(-800));
        // Fallback: serve silent video rather than fail completely
        console.warn("[ffmpeg] Falling back to silent video");
        fs.copyFileSync(videoPath, outputPath);
        resolve();
      }
    });

    proc.on("error", (err) => {
      console.warn("[ffmpeg] spawn error, falling back to silent video:", err.message);
      fs.copyFileSync(videoPath, outputPath);
      resolve();
    });
  });
}
