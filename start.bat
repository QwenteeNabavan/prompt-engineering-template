s@echo off
echo ========================================================
echo               AgentHub - Starting Services
echo ========================================================
start "AgentHub Backend (FastAPI)" cmd /k "cd backend && uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8001"
start "AgentHub Frontend (Vite)" cmd /k "cd frontend && npm run dev"
echo Services launched in separate windows!
echo - Frontend: http://localhost:5174/
echo - Backend:  http://localhost:8001/
echo - API Docs: http://localhost:8001/docs
echo ========================================================
pause
