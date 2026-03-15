import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import fs from "fs";
import path from "path";
import os from "os";

const VOICES: Record<string, string> = {
  fr: "fr-FR-DeniseNeural",
  en: "en-US-JennyNeural",
  es: "es-ES-ElviraNeural",
  ar: "ar-SA-ZariyahNeural",
};

// Reveal text templates per language
function revealText(answer: string, lang: string): string {
  switch (lang) {
    case "en": return `The answer is... ${answer}!`;
    case "es": return `La respuesta es... ${answer}!`;
    case "ar": return `الإجابة هي... ${answer}!`;
    default:   return `La réponse est... ${answer} !`;
  }
}

async function speakToFile(tts: MsEdgeTTS, text: string, outPath: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const readable = await tts.toStream(text);
      const ws = fs.createWriteStream(outPath);
      readable.pipe(ws);
      ws.on("finish", resolve);
      ws.on("error", reject);
      readable.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

export interface AudioSegments {
  question?: string;
  reveal?: string;
  explanation?: string;
}

export async function generateAudioSegments(
  question: { question: string; answer: string; explanation?: string },
  jobId: string,
  segmentPrefix: string = "",
  lang: string = "fr"
): Promise<AudioSegments> {
  const voice = VOICES[lang] || VOICES.fr;
  const tts = new MsEdgeTTS();

  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  } catch (err) {
    console.warn("[tts] Failed to initialize TTS, skipping audio:", err);
    return {};
  }

  const tmpDir = path.join(os.tmpdir(), "devinettelab-tts", jobId);
  fs.mkdirSync(tmpDir, { recursive: true });

  const prefix = segmentPrefix ? `${segmentPrefix}-` : "";
  const segments: AudioSegments = {};

  try {
    const qPath = path.join(tmpDir, `${prefix}question.mp3`);
    await speakToFile(tts, question.question, qPath);
    segments.question = qPath;
  } catch (err) {
    console.warn("[tts] question audio failed:", err);
  }

  try {
    const rPath = path.join(tmpDir, `${prefix}reveal.mp3`);
    await speakToFile(tts, revealText(question.answer, lang), rPath);
    segments.reveal = rPath;
  } catch (err) {
    console.warn("[tts] reveal audio failed:", err);
  }

  if (question.explanation) {
    try {
      const ePath = path.join(tmpDir, `${prefix}explanation.mp3`);
      await speakToFile(tts, question.explanation, ePath);
      segments.explanation = ePath;
    } catch (err) {
      console.warn("[tts] explanation audio failed:", err);
    }
  }

  return segments;
}

export function cleanupTTSDir(jobId: string): void {
  const dir = path.join(os.tmpdir(), "devinettelab-tts", jobId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
