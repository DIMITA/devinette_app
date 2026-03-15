from fastapi import APIRouter, HTTPException
from models.schemas import GenerateRequest, GenerateResponse
from services.claude_service import generate_questions
import json

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    try:
        questions = await generate_questions(req)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="L'IA a retourné une réponse invalide. Veuillez réessayer."
        )
    except Exception as e:
        error_msg = str(e)
        if "api_key" in error_msg.lower() or "authentication" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Clé API Claude invalide ou manquante.")
        if "rate_limit" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Limite de requêtes atteinte. Veuillez patienter.")
        raise HTTPException(status_code=500, detail=f"Erreur de génération : {error_msg}")

    return GenerateResponse(
        questions=questions,
        topic=req.topic,
        language=req.language,
        count=len(questions),
    )
