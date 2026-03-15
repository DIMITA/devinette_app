import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import generate

load_dotenv()

app = FastAPI(
    title="DevinetteLab API",
    description="API de génération automatique de quiz TikTok par IA",
    version="1.0.0",
)

# CORS — allow frontend dev server and production
origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "DevinetteLab API v1.0"}
