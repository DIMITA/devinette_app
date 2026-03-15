import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { renderVideo } from "./render";
import { RenderProps } from "./compositions/types";

const app = express();
app.use(express.json({ limit: "1mb" }));

// In-memory job store (swap for Redis/DB in production)
interface Job {
  jobId: string;
  status: "pending" | "rendering" | "done" | "error";
  templateId: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  outputPath?: string;
  errorMessage?: string;
  progress?: number;
}

const jobs = new Map<string, Job>();

// POST /render — submit a new render job
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
    jobId,
    status: "pending",
    templateId,
    createdAt: Date.now(),
  };
  jobs.set(jobId, job);

  // Start rendering asynchronously
  setImmediate(async () => {
    job.status = "rendering";
    job.startedAt = Date.now();
    try {
      const result = await renderVideo({ jobId, templateId, props });
      job.status = "done";
      job.completedAt = Date.now();
      job.outputPath = result.outputPath;
      console.log(`[server] Job ${jobId} done in ${result.durationMs}ms, ${Math.round(result.sizeBytes / 1024 / 1024 * 10) / 10}MB`);
    } catch (err: any) {
      job.status = "error";
      job.errorMessage = err.message || "Unknown render error";
      console.error(`[server] Job ${jobId} failed:`, err);
    }
  });

  res.status(202).json({ jobId, status: "pending" });
});

// GET /render/:jobId — poll job status
app.get("/render/:jobId", (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const response: Record<string, any> = {
    jobId: job.jobId,
    status: job.status,
    templateId: job.templateId,
    createdAt: job.createdAt,
  };

  if (job.startedAt) response.startedAt = job.startedAt;
  if (job.completedAt) response.completedAt = job.completedAt;
  if (job.status === "error") response.error = job.errorMessage;
  if (job.status === "done") {
    response.downloadUrl = `/render/${job.jobId}/download`;
  }

  res.json(response);
});

// GET /render/:jobId/download — serve the rendered MP4
app.get("/render/:jobId/download", (req: Request, res: Response) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "done" || !job.outputPath) {
    return res.status(409).json({ error: "Video not ready yet", status: job.status });
  }
  if (!fs.existsSync(job.outputPath)) {
    return res.status(410).json({ error: "Video file no longer available" });
  }

  const filename = `devinettelab-${job.templateId.toLowerCase()}-${job.jobId.slice(0, 8)}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");
  fs.createReadStream(job.outputPath).pipe(res);
});

// GET /health
app.get("/health", (_req, res) => {
  res.json({ status: "ok", jobs: jobs.size, service: "DevinetteLab Renderer v1.0" });
});

const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => {
  console.log(`[server] DevinetteLab Renderer running on http://localhost:${PORT}`);
});

export default app;
