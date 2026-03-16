import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, Response
from models.render_schemas import RenderRequest, MultiRenderRequest, RenderJobResponse
from services.render_service import (
    submit_render_job, submit_multi_render_job,
    get_render_job, get_render_download_url,
)

router = APIRouter()

RENDERER_URL = os.getenv("RENDERER_URL", "http://localhost:3001")


@router.get("/tts/preview")
async def tts_preview(voice: str = Query(default="fr", max_length=10)):
    """Proxy a TTS audio preview from the renderer. Returns an MP3."""
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            r = await client.get(f"{RENDERER_URL}/tts/preview", params={"voice": voice})
            r.raise_for_status()
            return Response(content=r.content, media_type="audio/mpeg")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Service de rendu non disponible")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"TTS preview failed: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/render", status_code=202)
async def create_render_job(req: RenderRequest):
    """Submit a new video render job."""
    try:
        job = await submit_render_job(req)
        return job
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Le service de rendu vidéo n'est pas disponible. Assurez-vous que le renderer est démarré."
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de soumission du rendu : {str(e)}")


@router.post("/render/multi", status_code=202)
async def create_multi_render_job(req: MultiRenderRequest):
    """Submit a multi-question video render job."""
    try:
        job = await submit_multi_render_job(req)
        return job
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Service de rendu vidéo non disponible")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/render/{job_id}")
async def get_job_status(job_id: str):
    """Poll job status from the renderer."""
    try:
        return await get_render_job(job_id)
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Service de rendu non disponible")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Job introuvable")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/render/{job_id}/download")
async def download_video(job_id: str):
    """Proxy the MP4 download from the renderer service."""
    try:
        renderer_url = await get_render_download_url(job_id)
        async with httpx.AsyncClient(timeout=120.0) as client:
            renderer_resp = await client.get(renderer_url)
            renderer_resp.raise_for_status()

        async def stream_video():
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("GET", renderer_url) as r:
                    async for chunk in r.aiter_bytes(chunk_size=65536):
                        yield chunk

        filename = f"devinettelab-{job_id[:8]}.mp4"
        return StreamingResponse(
            stream_video(),
            media_type="video/mp4",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Service de rendu non disponible")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Job introuvable")
        if e.response.status_code == 409:
            raise HTTPException(status_code=409, detail="Vidéo pas encore prête")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
