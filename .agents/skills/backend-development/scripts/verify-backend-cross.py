#!/usr/bin/env python3
"""Backend Verification Script for AgentHub.

Performs:
1. JSON Database Schema and Array Structure Validation
2. Python Module Compilation Check
3. Full Backend Integration Test Suite Execution
"""
import json
import py_compile
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    root_dir = Path(__file__).resolve().parents[4]
    backend_dir = root_dir / "backend"
    data_dir = backend_dir / "data"

    print("=== AgentHub Backend Verification ===")

    # 1. Database Check
    print("[1/3] Checking JSON storage arrays...")
    required_tables = ["agents.json", "categories.json", "collections.json", "upvotes.json", "reviews.json"]
    for table in required_tables:
        fpath = data_dir / table
        if not fpath.exists():
            print(f"  [FAIL] Missing database table: {table}")
            sys.exit(1)
        try:
            data = json.loads(fpath.read_text(encoding="utf-8"))
            if not isinstance(data, list):
                print(f"  [FAIL] Table {table} is not a JSON array.")
                sys.exit(1)
        except Exception as e:
            print(f"  [FAIL] JSON syntax error in {table}: {e}")
            sys.exit(1)
    print("  [PASS] All JSON database tables are valid arrays.")

    # 2. Syntax Compilation
    print("[2/3] Checking Python syntax in backend/app...")
    py_files = list((backend_dir / "app").glob("**/*.py"))
    for py_file in py_files:
        try:
            py_compile.compile(str(py_file), doraise=True)
        except py_compile.PyCompileError as e:
            print(f"  [FAIL] Syntax error in {py_file}: {e}")
            sys.exit(1)
    print(f"  [PASS] Compiled {len(py_files)} Python files successfully.")

    # 3. Test Suite
    print("[3/3] Running backend integration test suite...")
    test_script = backend_dir / "test_api.py"
    if not test_script.exists():
        print(f"  [FAIL] test_api.py not found at {test_script}")
        sys.exit(1)

    uv_cmd = shutil.which("uv.cmd") or shutil.which("uv") or "uv"
    result = subprocess.run([uv_cmd, "run", "python", "test_api.py"], cwd=str(backend_dir))
    if result.returncode != 0:
        print("  [FAIL] Backend integration test suite failed.")
        sys.exit(result.returncode)

    print("\n[SUCCESS] All backend verification checks passed!")


if __name__ == "__main__":
    main()
