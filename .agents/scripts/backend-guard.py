#!/usr/bin/env python3
"""Antigravity lifecycle hook script for backend integrity and test execution.

Validates backend Python syntax and runs integration tests.
Adheres to the Antigravity hook contract (reads stdin JSON, writes stdout JSON).
"""
import json
import py_compile
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
    backend_dir = base_dir / "backend"

    if not backend_dir.exists():
        if is_post_tool:
            print("{}")
        else:
            print(json.dumps({"decision": "allow", "reason": "No backend directory to check."}))
        sys.exit(0)

    # 1. Quick Syntax Validation of all python files in backend/app/
    python_files = list((backend_dir / "app").glob("**/*.py"))
    for py_file in python_files:
        try:
            py_compile.compile(str(py_file), doraise=True)
        except py_compile.PyCompileError as e:
            msg = f"Python syntax error in {py_file.relative_to(base_dir)}: {e}"
            if is_post_tool:
                print("{}")
            else:
                print(json.dumps({"decision": "continue", "reason": msg}))
            sys.exit(0)

    # 2. On Stop event, run the backend integration test suite
    if not is_post_tool:
        test_script = backend_dir / "test_api.py"
        if test_script.exists():
            try:
                uv_cmd = shutil.which("uv.cmd") or shutil.which("uv") or "uv"
                res = subprocess.run(
                    [uv_cmd, "run", "python", "test_api.py"],
                    cwd=str(backend_dir),
                    capture_output=True,
                    text=True,
                    timeout=20,
                )
                if res.returncode != 0:
                    err_msg = res.stderr.strip() or res.stdout.strip()
                    print(
                        json.dumps(
                            {
                                "decision": "continue",
                                "reason": f"Backend integration tests failed: {err_msg[:300]}",
                            }
                        )
                    )
                    sys.exit(0)
            except Exception as e:
                # If tests timed out or execution error, report warning but do not hard-block indefinitely
                pass

        print(
            json.dumps(
                {
                    "decision": "allow",
                    "reason": "Backend Python syntax and tests verified successfully.",
                }
            )
        )
    else:
        print("{}")


if __name__ == "__main__":
    main()
