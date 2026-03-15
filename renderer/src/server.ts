import express, { Request, Response } from "express";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { renderSingleVideo, renderMultiVideo } from "./render";
import { RenderProps } from "./compositions/types";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = parseInt(process.env.PORT || "3001", 10);

// ─── Job store ───────────────────────────────────────────────────────────────

interface Job {
  jobId: string;
  mode: "single" | "multi";
  status: "pending" | "rendering" | "done" | "error";
  templateId: string;
  questionCount: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  outputPath?: string;
  errorMessage?: string;
}

const jobs = new Map<string, Job>();

// ─── Submit single render ────────────────────────────────────────────────────

app.post("/render", async (req: Request, res: Response) => {
  const { templateId, props } = req.body as {
    templateId: "Template1" | "Template2" | "Template3";
    props: RenderProps;
  };

  if (!templateId || !["Template1", "Template2", "Template3"].includes(templateId)) {
    return res.status(400).json({ error: "templateId must be Template1, Template2, or Template3" });
  }
  if (!props?.question) {
    return res.status(400).json({ error: "props.question is required" });
  }

  const jobId = uuidv4();
  const job: Job = {
    jobId, mode: "single", status: "pending", templateId,
    questionCount: 1, createdAt: Date.now(),
  };
  jobs.set(jobId, job);

  setImmediate(async () => {
    job.status = "rendering";
    job.startedAt = Date.now();
    try {
      const result = await renderSingleVideo({ jobId, templateId, props });
      job.status = "done";
      job.completedAt = Date.now();
      job.outputPath = result.outputPath;
      console.log(`[server] Job ${jobId} done in ${result.durationMs}ms (${Math.round(result.sizeBytes / 1024 / 1024 * 10) / 10} MB)`);
    } catch (err: any) {
      job.status = "error";
      job.errorMessage = err.message || "Unknown render error";
      console.error(`[server] Job ${jobId} failed:`, err);
    }
  });

  res.status(202).json({ jobId, status: "pending" });
});

// ─── Submit multi-question render ─────────────────────────────────────────────

app.post("/render/multi", async (req: Request, res: Response) => {
  const { templateId, questions, watermark, lang } = req.body as {
    templateId: "Template1" | "Template2" | "Template3";
    questions: RenderProps["question"][];
    watermark?: string;
    lang?: string;
  };

  if (!templateId || !["Template1", "Template2", "Template3"].includes(templateId)) {
    return res.status(400).json({ error: "templateId must be Template1, Template2, or Template3" });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "questions must be a non-empty array" });
  }
  if (questions.length > 10) {
    return res.status(400).json({ error: "Maximum 10 questions per video" });
  }

  const jobId = uuidv4();
  const job: Job = {
    jobId, mode: "multi", status: "pending", templateId,
    questionCount: questions.length, createdAt: Date.now(),
  };
  jobs.set(jobId, job);

  setImmediate(async () => {
    job.status = "rendering";
    job.startedAt = Date.now();
    try {
      const result = await renderMultiVideo({
        jobId, templateId, questions, watermark, lang,
      });
      job.status = "done";
      job.completedAt = Date.now();
      job.outputPath = result.outputPath;
      const mb = Math.round(result.sizeBytes / 1024 / 1024 * 10) / 10;
      const sec = Math.round(result.durationMs / 1000);
      console.log(`[server] Multi job ${jobId} done in ${sec}s (${mb} MB, ${questions.length} questions)`);
    } catch (err: any) {
      job.status = "error";
      job.errorMessage = err.message || "Unknown render error";
      console.error(`[server] Multi job ${jobId} failed:`, err);
    }
  });

  res.status(202).json({ jobId, status: "pending", questionCount: questions.length });
});

// ─── Poll job status ──────────────────────────────────────────────────────────

app.get("/render/:jobId", (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const resp: Record<string, any> = {
    jobId: job.jobId,
    status: job.status,
    templateId: job.templateId,
    mode: job.mode,
    questionCount: job.questionCount,
    createdAt: job.createdAt,
  };
  if (job.startedAt) resp.startedAt = job.startedAt;
  if (job.completedAt) resp.completedAt = job.completedAt;
  if (job.status === "error") resp.error = job.errorMessage;
  if (job.status === "done") resp.downloadUrl = `/render/${job.jobId}/download`;

  res.json(resp);
});

// ─── Download MP4 ─────────────────────────────────────────────────────────────

app.get("/render/:jobId/download", (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "done" || !job.outputPath) {
    return res.status(409).json({ error: "Video not ready", status: job.status });
  }
  if (!fs.existsSync(job.outputPath)) {
    return res.status(410).json({ error: "Video file no longer available" });
  }

  const qStr = job.mode === "multi" ? `-${job.questionCount}q` : "";
  const filename = `devinettelab-${job.templateId.toLowerCase()}${qStr}-${job.jobId.slice(0, 8)}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");
  fs.createReadStream(job.outputPath).pipe(res);
});

// ─── Health ────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "DevinetteLab Renderer v2.1",
    jobs: jobs.size,
    features: ["tts-gtts", "ffmpeg-mix", "multi-question", "templates:3"],
  });
});

app.listen(PORT, () => {
  console.log(`[server] DevinetteLab Renderer v2.0 on http://localhost:${PORT}`);
  console.log(`[server] Features: TTS audio | Multi-question video | 3 templates`);
});

export default app;
