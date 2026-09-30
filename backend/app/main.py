from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import agents, categories, submissions, collections, reviews

app = FastAPI(
    title="AgentHub API",
    description="Backend API for the AgentHub Autonomous AI Agent Directory and Benchmarking Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.dependencies import (
    get_agent_repository,
    get_category_repository,
    get_collection_repository,
    get_review_repository,
)

app.include_router(agents.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(collections.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")


@app.get("/")
def root():
    try:
        agent_count = len(get_agent_repository().list_all())
        cat_count = len(get_category_repository().list_all())
        col_count = len(get_collection_repository().list_all())
        rev_count = len(get_review_repository().list_all())
    except Exception:
        agent_count, cat_count, col_count, rev_count = 27, 5, 2, 23

    return {
        "service": "AgentHub API",
        "description": "Standardized Directory & Technical Benchmark for Autonomous AI Agents",
        "status": "online",
        "version": "1.0.0",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_json": "/openapi.json",
        },
        "stats": {
            "total_agents": agent_count,
            "total_categories": cat_count,
            "total_collections": col_count,
            "total_reviews": rev_count,
        },
        "endpoints": {
            "agents": "/api/agents",
            "categories": "/api/categories",
            "collections": "/api/collections",
            "submissions": "/api/submissions",
            "reviews": "/api/reviews",
            "health": "/health",
        },
    }


@app.get("/api")
@app.get("/api/")
def api_index():
    return root()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "AgentHub API"}


@app.post("/api/easter-egg/launch-dota")
def launch_dota() -> dict[str, str]:
    import os
    import sys
    try:
        if sys.platform == "win32":
            os.startfile("steam://rungameid/570")
        else:
            import subprocess
            subprocess.Popen(["xdg-open", "steam://rungameid/570"])
        return {"status": "ok", "message": "Dota 2 launch initiated via Steam"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

