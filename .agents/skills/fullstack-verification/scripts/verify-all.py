#!/usr/bin/env python3
"""One-shot full-stack verification script for AgentHub.

Validates:
1. JSON database integrity (arrays in backend/data/*.json)
2. Backend linting (Ruff), type checking (Mypy), and integration tests (test_api.py)
3. Frontend formatting (Prettier), type checking (tsc -b), and production build
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path


def check_data_integrity(repo_root: Path) -> bool:
    print("[1/3] Checking JSON database integrity...")
    data_dir = repo_root / "backend" / "data"
    required_files = [
        "categories.json",
        "agents.json",
        "collections.json",
        "upvotes.json",
        "reviews.json",
    ]

    for fname in required_files:
        fpath = data_dir / fname
        if not fpath.exists():
            print(f"  [FAIL] Missing file: {fpath}")
            return False
        try:
            content = json.loads(fpath.read_text(encoding="utf-8"))
            if not isinstance(content, list):
                print(f"  [FAIL] {fname} must contain a JSON array")
                return False
        except Exception as e:
            print(f"  [FAIL] Corrupted JSON in {fname}: {e}")
            return False
    print("  [PASS] All 5 database files are valid JSON arrays.")
    return True


def run_backend_checks(repo_root: Path) -> bool:
    print("\n[2/3] Running backend checks (Ruff, Mypy, test_api.py)...")
    backend_dir = repo_root / "backend"
    uv_cmd = shutil.which("uv.cmd") or shutil.which("uv") or "uv"

    # 1. Ruff lint check
    print("  --> Ruff linting...")
    res = subprocess.run([uv_cmd, "run", "ruff", "check", "."], cwd=str(backend_dir), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [FAIL] Ruff check failed:\n{res.stderr}\n{res.stdout}")
        return False

    # 2. Ruff format check
    print("  --> Ruff formatting...")
    res = subprocess.run([uv_cmd, "run", "ruff", "format", "--check", "."], cwd=str(backend_dir), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [FAIL] Ruff format check failed:\n{res.stderr}\n{res.stdout}")
        return False

    # 3. Mypy type check
    print("  --> Mypy type checking...")
    res = subprocess.run([uv_cmd, "run", "mypy"], cwd=str(backend_dir), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [FAIL] Mypy failed:\n{res.stderr}\n{res.stdout}")
        return False

    # 4. Integration test suite
    print("  --> Integration test suite...")
    res = subprocess.run([uv_cmd, "run", "python", "test_api.py"], cwd=str(backend_dir), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [FAIL] Backend tests failed:\n{res.stderr}\n{res.stdout}")
        return False

    print("  [PASS] Backend linting, typing, and 10 test suites passed cleanly.")
    return True


def run_frontend_build(repo_root: Path) -> bool:
    print("\n[3/3] Running frontend verification (Oxlint, Prettier, tsc -b, vite build)...")
    frontend_dir = repo_root / "frontend"
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

    # 1. Oxlint check
    print("  --> Oxlint linting...")
    res = subprocess.run([npm_cmd, "run", "lint"], cwd=str(frontend_dir), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [FAIL] Oxlint failed:\n{res.stderr}\n{res.stdout}")
        return False

    # 2. Prettier check
    print("  --> Prettier code style check...")
    res = subprocess.run([npm_cmd, "run", "format:check"], cwd=str(frontend_dir), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [FAIL] Prettier formatting check failed:\n{res.stderr}\n{res.stdout}")
        return False

    # 3. TypeScript compilation and Vite build
    print("  --> TypeScript compilation & Vite build...")
    res = subprocess.run([npm_cmd, "run", "build"], cwd=str(frontend_dir), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [FAIL] Frontend build failed:\n{res.stderr}\n{res.stdout}")
        return False

    print("  [PASS] Frontend linting, formatting, types, and build succeeded with zero errors.")
    return True


def main():
    repo_root = Path(__file__).resolve().parents[4]
    print(f"Starting AgentHub Full-Stack Verification at: {repo_root}\n")

    if not check_data_integrity(repo_root):
        sys.exit(1)
    if not run_backend_checks(repo_root):
        sys.exit(1)
    if not run_frontend_build(repo_root):
        sys.exit(1)

    print("\n=======================================================")
    print(" ALL AGENTHUB VERIFICATION CHECKS PASSED SUCCESSFULLY! ")
    print("=======================================================")


if __name__ == "__main__":
    main()
