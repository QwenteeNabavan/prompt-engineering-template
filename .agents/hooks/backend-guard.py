#!/usr/bin/env python3
# === [DEMO-06] Deterministic Backend Hook: PostToolUse Auto-Format + Stop Gate ===
"""Antigravity lifecycle hook script for backend linting, formatting, type-checking, and tests.

- PostToolUse: Auto-formats modified backend Python files with Ruff and checks Python syntax.
- Stop: Runs Ruff linter, Ruff format check, Mypy type checker, and backend integration tests.
Adheres to the Antigravity hook contract (reads stdin JSON, writes stdout JSON).
"""
import json
import os
import py_compile
import shutil
import subprocess
import sys
from pathlib import Path


def read_stdin_payload() -> dict:
    try:
        if sys.stdin.isatty():
            return {}
        if os.name == "nt":
            import ctypes
            import msvcrt

            handle = msvcrt.get_osfhandle(sys.stdin.fileno())
            avail = ctypes.c_ulong(0)
            if not ctypes.windll.kernel32.PeekNamedPipe(handle, None, 0, None, ctypes.byref(avail), None):
                return {}
            if avail.value == 0:
                return {}
            raw = os.read(sys.stdin.fileno(), avail.value).decode("utf-8", errors="replace")
        else:
            import select

            if not select.select([sys.stdin], [], [], 0.0)[0]:
                return {}
            raw = sys.stdin.read()
        if raw.strip():
            return json.loads(raw)
    except Exception:
        pass
    return {}


def main() -> None:
    payload = read_stdin_payload()

    # Distinguish between PostToolUse and Stop events
    is_post_tool = "stepIdx" in payload and "terminationReason" not in payload

    # Resolve workspace root from .agents/hooks/ or .agents/scripts/ (parents[2])
    base_dir = Path(__file__).resolve().parents[2]
    backend_dir = base_dir / "backend"

    if not backend_dir.exists():
        if is_post_tool:
            print("{}")
        else:
            print(json.dumps({"decision": "allow", "reason": "No backend directory to check."}))
        sys.exit(0)

    uv_cmd = shutil.which("uv.cmd") or shutil.which("uv") or "uv"

    # On PostToolUse: if a backend .py file was modified, auto-format and lint-fix it with Ruff
    if is_post_tool:
        tool_args = payload.get("toolCall", {}).get("args", {})
        target_file = (
            tool_args.get("Path") or tool_args.get("TargetFile") or tool_args.get("file_path") or ""
        )
        if target_file:
            try:
                target_path = Path(target_file).resolve()
                if target_path.suffix == ".py" and backend_dir in target_path.parents and target_path.exists():
                    subprocess.run(
                        [uv_cmd, "run", "ruff", "format", str(target_path)],
                        cwd=str(backend_dir),
                        stdin=subprocess.DEVNULL,
                        capture_output=True,
                        text=True,
                        timeout=15,
                    )
                    subprocess.run(
                        [uv_cmd, "run", "ruff", "check", "--fix", str(target_path)],
                        cwd=str(backend_dir),
                        stdin=subprocess.DEVNULL,
                        capture_output=True,
                        text=True,
                        timeout=15,
                    )
            except Exception:
                pass
        print("{}")
        sys.exit(0)

    if payload.get("terminationReason") in {
        "USER_CANCELED",
        "MAX_INVOCATIONS",
        "MAX_FORCED_INVOCATIONS",
        "MAX_TOKEN_BUDGET_EXCEEDED",
    }:
        print(json.dumps({"decision": "allow"}))
        sys.exit(0)

    # 1. Quick Syntax Validation of all python files in backend/app/
    python_files = list((backend_dir / "app").glob("**/*.py"))
    for py_file in python_files:
        try:
            py_compile.compile(str(py_file), doraise=True)
        except py_compile.PyCompileError as e:
            msg = f"Python syntax error in {py_file.relative_to(base_dir)}: {e}"
            print(json.dumps({"decision": "continue", "reason": msg}))
            sys.exit(0)

    # 2. On Stop event: run Ruff linter, Ruff formatter check, Mypy type-checker, and test suite
    checks = [
        ("Ruff Linter", [uv_cmd, "run", "ruff", "check", "."]),
        ("Ruff Formatter", [uv_cmd, "run", "ruff", "format", "--check", "."]),
        ("Mypy Type Checker", [uv_cmd, "run", "mypy"]),
    ]

    test_script = backend_dir / "test_api.py"
    if test_script.exists():
        checks.append(("Backend Integration Tests", [uv_cmd, "run", "python", "test_api.py"]))

    for label, cmd in checks:
        try:
            res = subprocess.run(
                cmd,
                cwd=str(backend_dir),
                stdin=subprocess.DEVNULL,
                capture_output=True,
                text=True,
                timeout=45,
            )
            if res.returncode != 0:
                err = (res.stdout.strip() + "\n" + res.stderr.strip()).strip()
                print(
                    json.dumps(
                        {
                            "decision": "continue",
                            "reason": f"{label} failed (exit code {res.returncode}):\n{err[-500:]}",
                        }
                    )
                )
                sys.exit(0)
        except Exception as e:
            print(
                json.dumps(
                    {
                        "decision": "continue",
                        "reason": f"Could not complete {label}: {e}",
                    }
                )
            )
            sys.exit(0)

    print(
        json.dumps(
            {
                "decision": "allow",
                "reason": "Backend linter (Ruff), formatter, type checker (Mypy), and integration tests verified successfully.",
            }
        )
    )


if __name__ == "__main__":
    main()
