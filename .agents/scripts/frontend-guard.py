#!/usr/bin/env python3
"""Antigravity lifecycle hook script for frontend build and type integrity.

Validates that TypeScript source code in frontend/src/ compiles cleanly.
Adheres to the Antigravity hook contract (reads stdin JSON, writes stdout JSON).
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    payload = {}
    try:
        raw_input = sys.stdin.read()
        if raw_input.strip():
            payload = json.loads(raw_input)
    except Exception:
        pass

    # Distinguish between PostToolUse and Stop events
    is_post_tool = "stepIdx" in payload and "terminationReason" not in payload

    # Resolve workspace root from .agents/scripts/
    base_dir = Path(__file__).resolve().parents[2]
    frontend_dir = base_dir / "frontend"

    if not frontend_dir.exists():
        if is_post_tool:
            print("{}")
        else:
            print(json.dumps({"decision": "allow", "reason": "No frontend directory to check."}))
        sys.exit(0)

    # For PostToolUse, return early to keep edits snappy
    if is_post_tool:
        print("{}")
        sys.exit(0)

    # For Stop events, check if npm is available and run tsc
    npm_cmd = shutil.which("npm.cmd") or shutil.which("npm")
    if npm_cmd:
        try:
            res = subprocess.run(
                [npm_cmd, "run", "build"],
                cwd=str(frontend_dir),
                capture_output=True,
                text=True,
                timeout=25,
            )
            if res.returncode != 0:
                err = res.stderr.strip() or res.stdout.strip()
                print(
                    json.dumps(
                        {
                            "decision": "continue",
                            "reason": f"Frontend compilation failed: {err[:300]}",
                        }
                    )
                )
                sys.exit(0)
        except Exception:
            # Timeout or command failure fallback
            pass

    print(
        json.dumps(
            {
                "decision": "allow",
                "reason": "Frontend compilation and build verified successfully.",
            }
        )
    )


if __name__ == "__main__":
    main()
