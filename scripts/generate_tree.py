#!/usr/bin/env python3
"""Print the file tree, write it into ARCHITECTURE.md, or check that it is current."""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARCHITECTURE = ROOT / "ARCHITECTURE.md"
START, END = "<!-- tree:start -->", "<!-- tree:end -->"
IGNORED = {".git", "node_modules", "__pycache__", ".ruff_cache", ".venv", "dist", ".pytest_cache"}
TEMPLATE_ONLY = {"init_app.py", "TEMPLATE.md"}
MAX_DEPTH = 4


def get_entries(directory: Path) -> list[Path]:
	entries = [
		path
		for path in directory.iterdir()
		if path.name not in IGNORED | TEMPLATE_ONLY and path.name != ".gitkeep"
	]
	return sorted(entries, key=lambda path: (path.is_file(), path.name.lower()))


def build_lines(directory: Path, prefix: str = "", depth: int = 1) -> list[str]:
	lines = []
	entries = get_entries(directory)
	for index, path in enumerate(entries):
		is_last = index == len(entries) - 1
		lines.append(f"{prefix}{'└── ' if is_last else '├── '}{path.name}{'/' if path.is_dir() else ''}")
		if path.is_dir() and depth < MAX_DEPTH:
			lines += build_lines(path, prefix + ("    " if is_last else "│   "), depth + 1)
	return lines


def get_tree() -> str:
	return "\n".join([f"{ROOT.name}/", *build_lines(ROOT)])


def get_architecture_with_tree() -> str:
	text = ARCHITECTURE.read_text()
	before, _, rest = text.partition(START)
	_, _, after = rest.partition(END)
	return f"{before}{START}\n```text\n{get_tree()}\n```\n{END}{after}"


def main():
	parser = argparse.ArgumentParser(description=__doc__)
	parser.add_argument("--write", action="store_true", help="update ARCHITECTURE.md")
	parser.add_argument("--check", action="store_true", help="exit 1 when ARCHITECTURE.md is out of date")
	arguments = parser.parse_args()

	if arguments.write:
		ARCHITECTURE.write_text(get_architecture_with_tree())
	elif arguments.check:
		if ARCHITECTURE.read_text() != get_architecture_with_tree():
			sys.exit(
				"ARCHITECTURE.md file tree is out of date. Run: python3 scripts/generate_tree.py --write"
			)
	else:
		print(get_tree())


if __name__ == "__main__":
	main()
