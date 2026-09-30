#!/usr/bin/env python3
"""Antigravity lifecycle hook script for data integrity.

Validates that JSON storage files in backend/data/ are well-formed arrays.
Supports both Stop and PostToolUse event contracts.
"""
import json
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

    # Check if this is a PostToolUse event or Stop event
    is_post_tool = "stepIdx" in payload and "terminationReason" not in payload

    # Locate data directory relative to .agents/ directory
    base_dir = Path(__file__).resolve().parents[2]
    data_dir = base_dir / "backend" / "data"

    required_files = [
        "agents.json",
        "categories.json",
        "collections.json",
        "upvotes.json",
        "reviews.json",
    ]

    for fname in required_files:
        fpath = data_dir / fname
        if not fpath.exists():
            if is_post_tool:
                print("{}")
            else:
                print(
                    json.dumps(
                        {
                            "decision": "continue",
                            "reason": f"Required database file {fname} is missing at {fpath}.",
                        }
                    )
                )
            sys.exit(0)

        try:
            content = json.loads(fpath.read_text(encoding="utf-8"))
            if not isinstance(content, list):
                if is_post_tool:
                    print("{}")
                else:
                    print(
                        json.dumps(
                            {
                                "decision": "continue",
                                "reason": f"Integrity failure: {fname} must contain a JSON array.",
                            }
                        )
                    )
                sys.exit(0)
        except Exception as e:
            if is_post_tool:
                print("{}")
            else:
                print(
                    json.dumps(
                        {
                            "decision": "continue",
                            "reason": f"Corrupted JSON in {fname}: {e}",
                        }
                    )
                )
            sys.exit(0)

    # All checks passed
    if is_post_tool:
        print("{}")
    else:
        print(
            json.dumps(
                {
                    "decision": "allow",
                    "reason": "AgentHub data integrity verified. All database files are well-formed.",
                }
            )
        )


if __name__ == "__main__":
    main()
