@echo off
REM Windows batch pre-commit hook for AgentHub
echo [AgentHub] Running pre-commit validation...

echo [1/4] Checking backend Ruff linter, Ruff formatter, and Mypy...
cd backend
call uv run ruff check .
if %errorlevel% neq 0 (
    echo [ERROR] Backend ruff check failed! Run 'uv run ruff check --fix .'
    cd ..
    exit /b 1
)
call uv run ruff format --check .
if %errorlevel% neq 0 (
    echo [ERROR] Backend ruff format failed! Run 'uv run ruff format .'
    cd ..
    exit /b 1
)
call uv run mypy
if %errorlevel% neq 0 (
    echo [ERROR] Backend mypy typecheck failed!
    cd ..
    exit /b 1
)
cd ..

echo [2/4] Checking frontend Oxlint, Prettier, and TypeScript...
cd frontend
call npm run lint
if %errorlevel% neq 0 (
    echo [ERROR] Frontend Oxlint check failed! Run 'npm run lint:fix'
    cd ..
    exit /b 1
)
call npm run format:check
if %errorlevel% neq 0 (
    echo [ERROR] Frontend formatting failed! Run 'npm run format'
    cd ..
    exit /b 1
)
call npm run type-check
if %errorlevel% neq 0 (
    echo [ERROR] Frontend TypeScript typecheck failed!
    cd ..
    exit /b 1
)
cd ..

echo [3/4] Checking JSON data store integrity...
call python .agents\hooks\guard-integrity.py
if %errorlevel% neq 0 (
    echo [ERROR] Data integrity check failed!
    exit /b 1
)

echo [4/4] Checking backend test suite...
cd backend
call uv run python test_api.py
if %errorlevel% neq 0 (
    echo [ERROR] Backend tests failed!
    cd ..
    exit /b 1
)
cd ..
git checkout -- backend/data/ >nul 2>&1

echo [SUCCESS] All checks PASSED! Safe to commit.
exit /b 0
