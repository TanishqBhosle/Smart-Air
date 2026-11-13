"""SmartAir Server Launcher.
Safely configures PYTHONPATH and port binding to prevent local project collisions.
"""

import os
import sys
from pathlib import Path

# Fix sys.path and PYTHONPATH to point exclusively to SmartAir
ROOT_DIR = str(Path(__file__).resolve().parent)
sys.path = [p for p in sys.path if "ProcureYard" not in p]
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
os.environ["PYTHONPATH"] = ROOT_DIR

import uvicorn

if __name__ == "__main__":
    port = 8001
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])

    print(f"[SmartAir] Initializing server on http://127.0.0.1:{port}")
    print(f"[SmartAir] Root Directory: {ROOT_DIR}")
    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=port,
        reload=False,
    )
