#!/usr/bin/env python3
"""Antigravity lifecycle hook script for frontend linting, formatting, and type-checking.

- PostToolUse: Auto-formats modified frontend source files with Prettier.
- Stop: Runs Oxlint linter, Prettier format check, and TypeScript type checker (tsc -b --noEmit).
Adheres to the Antigravity hook contract (reads stdin JSON, writes stdout JSON).
"""
import json
import os
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
    frontend_dir = base_dir / "frontend"

    if not frontend_dir.exists():
        if is_post_tool:
            print("{}")
        else:
            print(json.dumps({"decision": "allow", "reason": "No frontend directory to check."}))
        sys.exit(0)

    npm_cmd = shutil.which("npm.cmd") or shutil.which("npm")
    npx_cmd = shutil.which("npx.cmd") or shutil.which("npx")

    # On PostToolUse: if a frontend source file was modified, auto-format it with Prettier
    if is_post_tool:
        tool_args = payload.get("toolCall", {}).get("args", {})
        target_file = (
            tool_args.get("Path") or tool_args.get("TargetFile") or tool_args.get("file_path") or ""
        )
        if target_file and npx_cmd:
            try:
                target_path = Path(target_file).resolve()
                if (
                    target_path.suffix in {".ts", ".tsx", ".css", ".json"}
                    and (frontend_dir / "src") in target_path.parents
                    and target_path.exists()
                ):
                    subprocess.run(
                        [npx_cmd, "prettier", "--write", str(target_path)],
                        cwd=str(frontend_dir),
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

    # On Stop events: run linter (Oxlint), formatter check (Prettier), and type checker (tsc)
    if npm_cmd:
        checks = [
            ("Frontend Linter (Oxlint)", [npm_cmd, "run", "lint"]),
            ("Frontend Formatter (Prettier)", [npm_cmd, "run", "format:check"]),
            ("Frontend Type Checker (TypeScript)", [npm_cmd, "run", "type-check"]),
        ]
        for label, cmd in checks:
            try:
                res = subprocess.run(
                    cmd,
                    cwd=str(frontend_dir),
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
                                "reason": f"{label} failed:\n{err[-500:]}",
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
                "reason": "Frontend linter (Oxlint), formatter (Prettier), and type checker (TypeScript) verified successfully.",
            }
        )
    )


if __name__ == "__main__":
    main()
