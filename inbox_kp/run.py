#!/usr/bin/env python3
from pathlib import Path

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8765,
        reload=True,
        reload_dirs=[str(Path(__file__).parent / "app"), str(Path(__file__).parent / "static")],
    )
