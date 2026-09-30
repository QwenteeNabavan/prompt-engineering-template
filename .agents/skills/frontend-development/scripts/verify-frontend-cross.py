#!/usr/bin/env python3
"""Frontend Verification Script for AgentHub.

Performs:
1. Checks that node_modules and configuration exist
2. Runs TypeScript type checking and Vite build (npm run build)
"""
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    root_dir = Path(__file__).resolve().parents[4]
    frontend_dir = root_dir / "frontend"

    print("=== AgentHub Frontend Verification ===")

    # 1. Environment Check
    print("[1/2] Checking frontend environment...")
    npm_cmd = shutil.which("npm.cmd") or shutil.which("npm")
    if not npm_cmd:
        print("  [FAIL] npm executable not found in PATH.")
        sys.exit(1)

    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("  [FAIL] node_modules not found. Run 'npm install' in frontend/.")
        sys.exit(1)
    print("  [PASS] Node and dependencies present.")

    # 2. Build & TypeScript compilation
    print("[2/2] Running 'npm run build' (tsc -b && vite build)...")
    result = subprocess.run([npm_cmd, "run", "build"], cwd=str(frontend_dir))
    if result.returncode != 0:
        print("  [FAIL] Frontend build failed.")
        sys.exit(result.returncode)

    print("\n[SUCCESS] Frontend verification passed with zero compilation errors!")


if __name__ == "__main__":
    main()
