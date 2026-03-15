import path from "path";
import os from "os";
import fs from "fs";

// node-gtts uses Google Translate TTS API — free, no API key, reliable
const gTTS = require("node-gtts");

const LANG_MAP: Record<string, string> = {
  fr: "fr",
  en: "en",
  es: "es",
  ar: "ar",
};

export interface VoiceScript {
  questionLine: string;   // text read during question phase
  revealLine: string;     // text read when answer is revealed
  explanationLine?: string;
}

export function buildVoiceScript(
  question: { question: string; answer: string; explanation?: string },
  lang: string = "fr"
): VoiceScript {
  switch (lang) {
    case "en":
      return {
        questionLine: `Here is your question ! ${question.question}`,
        revealLine: `The answer is... ${question.answer} !`,
        explanationLine: question.explanation
          ? `Did you know? ${question.explanation}`
          : undefined,
      };
    case "es":
      return {
        questionLine: `¡ Aquí está tu pregunta ! ${question.question}`,
        revealLine: `¡ La respuesta es... ${question.answer} !`,
        explanationLine: question.explanation
          ? `¿ Sabías que ? ${question.explanation}`
          : undefined,
      };
    default: // fr
      return {
        questionLine: `Voici ta question ! ${question.question}`,
        revealLine: `La bonne réponse est... ${question.answer} !`,
        explanationLine: question.explanation
          ? `Le savais-tu ? ${question.explanation}`
          : undefined,
      };
  }
}

async function speakToFile(text: string, lang: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tts = gTTS(lang);
      tts.save(outPath, text, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

export interface AudioFiles {
  question?: string;
  reveal?: string;
  explanation?: string;
}

export async function generateAudioFiles(
  question: { question: string; answer: string; explanation?: string },
  jobId: string,
  segmentPrefix: string = "",
  lang: string = "fr"
): Promise<AudioFiles> {
  const ttsLang = LANG_MAP[lang] || "fr";
  const script = buildVoiceScript(question, lang);

  const tmpDir = path.join(os.tmpdir(), "devinettelab-tts", jobId);
  fs.mkdirSync(tmpDir, { recursive: true });

  const prefix = segmentPrefix ? `${segmentPrefix}-` : "";
  const files: AudioFiles = {};

  try {
    const qPath = path.join(tmpDir, `${prefix}question.mp3`);
    await speakToFile(script.questionLine, ttsLang, qPath);
    files.question = qPath;
    console.log(`[tts] question audio OK: ${qPath}`);
  } catch (err) {
    console.warn("[tts] question audio failed:", err);
  }

  try {
    const rPath = path.join(tmpDir, `${prefix}reveal.mp3`);
    await speakToFile(script.revealLine, ttsLang, rPath);
    files.reveal = rPath;
    console.log(`[tts] reveal audio OK: ${rPath}`);
  } catch (err) {
    console.warn("[tts] reveal audio failed:", err);
  }

  if (script.explanationLine) {
    try {
      const ePath = path.join(tmpDir, `${prefix}explanation.mp3`);
      await speakToFile(script.explanationLine, ttsLang, ePath);
      files.explanation = ePath;
      console.log(`[tts] explanation audio OK: ${ePath}`);
    } catch (err) {
      console.warn("[tts] explanation audio failed:", err);
    }
  }

  return files;
}

export function cleanupTTSDir(jobId: string): void {
  const dir = path.join(os.tmpdir(), "devinettelab-tts", jobId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
