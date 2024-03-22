#!/usr/bin/env python

import sys
from pathlib import Path

def make_indexes(containing_dir: Path):
    for dir, _, _ in containing_dir.walk():
        # don't create a top-level _index
        if dir == containing_dir:
            continue

        index_path = dir / "_index.md"
        if not index_path.exists():
            index_path.write_text(f"---\ntitle: {dir.name.title()}\n---\n")

if __name__ == "__main__":
    make_indexes(Path(sys.argv[1]))