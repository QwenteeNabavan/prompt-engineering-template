#!/usr/bin/env python3
"""One-shot full-stack verification script for AgentHub.

Validates backend test suite, database JSON integrity, and frontend build.
"""
import json
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
    print("  [PASS] All 4 database files valid JSON arrays.")
    return True


def run_backend_tests(repo_root: Path) -> bool:
    print("\n[2/3] Running backend test suite...")
    backend_dir = repo_root / "backend"
    res = subprocess.run(
        ["uv", "run", "python", "test_api.py"],
        cwd=str(backend_dir),
        capture_output=True,
        text=True,
    )
    if res.returncode != 0:
        print(f"  [FAIL] Backend tests failed:\n{res.stderr}\n{res.stdout}")
        return False
    print("  [PASS] Backend test suite passed cleanly.")
    return True


def run_frontend_build(repo_root: Path) -> bool:
    print("\n[3/3] Running frontend build (tsc -b && vite build)...")
    frontend_dir = repo_root / "frontend"
    # Run npm run build
    res = subprocess.run(
        ["npm.cmd" if sys.platform == "win32" else "npm", "run", "build"],
        cwd=str(frontend_dir),
        capture_output=True,
        text=True,
    )
    if res.returncode != 0:
        print(f"  [FAIL] Frontend build failed:\n{res.stderr}\n{res.stdout}")
        return False
    print("  [PASS] Frontend build succeeded with zero errors.")
    return True


def main():
    repo_root = Path(__file__).resolve().parents[4]
    print(f"Starting AgentHub Full-Stack Verification at: {repo_root}\n")

    if not check_data_integrity(repo_root):
        sys.exit(1)
    if not run_backend_tests(repo_root):
        sys.exit(1)
    if not run_frontend_build(repo_root):
        sys.exit(1)

    print("\n=======================================================")
    print(" ALL AGENTHUB VERIFICATION CHECKS PASSED SUCCESSFULLY! ")
    print("=======================================================")


if __name__ == "__main__":
    main()
