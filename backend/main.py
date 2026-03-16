import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db
from routers import generate, render
from routers import auth as auth_router
from routers import schedule as schedule_router
from services.scheduler_service import start_scheduler, stop_scheduler

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


app = FastAPI(
    title="DevinetteLab API",
    description="API de génération automatique de quiz TikTok par IA",
    version="3.0.0",
    lifespan=lifespan,
)

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
app.include_router(render.router, prefix="/api")
app.include_router(auth_router.router, prefix="/api")
app.include_router(schedule_router.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "DevinetteLab API v3.0", "phase": "1+2+3"}
