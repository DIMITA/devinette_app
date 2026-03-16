import os
import httpx
from models.render_schemas import RenderRequest, MultiRenderRequest, RenderJobResponse

RENDERER_URL = os.getenv("RENDERER_URL", "http://localhost:3001")


def _build_renderer_payload(req: RenderRequest) -> dict:
    return {
        "templateId": req.template_id.value,
        "props": {
            "question": {
                "question": req.question.question,
                "options": req.question.options,
                "answer": req.question.answer,
                "explanation": req.question.explanation,
                "difficulty": req.question.difficulty,
            },
            "questionIndex": req.question_index,
            "totalQuestions": req.total_questions,
            "showTimer": req.show_timer,
            "timerDuration": req.timer_duration,
            "revealDelay": req.reveal_delay,
            "watermark": req.watermark,
            "lang": req.lang or "fr",
            "colorScheme": req.color_scheme,
            "bgPattern": req.bg_pattern,
        },
    }


def _build_multi_renderer_payload(req: MultiRenderRequest) -> dict:
    return {
        "templateId": req.template_id.value,
        "questions": [
            {
                "question": q.question,
                "options": q.options,
                "answer": q.answer,
                "explanation": q.explanation,
                "difficulty": q.difficulty,
            }
            for q in req.questions
        ],
        "watermark": req.watermark,
        "lang": req.lang or "fr",
        "voice": req.voice,
        "colorScheme": req.color_scheme,
        "bgPattern": req.bg_pattern,
    }


async def submit_render_job(req: RenderRequest) -> dict:
    """Submit a render job to the Node.js renderer service."""
    payload = _build_renderer_payload(req)
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(f"{RENDERER_URL}/render", json=payload)
        resp.raise_for_status()
        return resp.json()


async def get_render_job(job_id: str) -> dict:
    """Poll the renderer service for job status."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{RENDERER_URL}/render/{job_id}")
        resp.raise_for_status()
        data = resp.json()

        # Rewrite download URL to go through our backend proxy
        if data.get("downloadUrl"):
            data["downloadUrl"] = f"/api/render/{job_id}/download"

        return data


async def get_render_download_url(job_id: str) -> str:
    """Return the direct renderer download URL for proxying."""
    return f"{RENDERER_URL}/render/{job_id}/download"


async def submit_multi_render_job(req: MultiRenderRequest) -> dict:
    """Submit a multi-question render job to the renderer."""
    payload = _build_multi_renderer_payload(req)
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(f"{RENDERER_URL}/render/multi", json=payload)
        resp.raise_for_status()
        return resp.json()
