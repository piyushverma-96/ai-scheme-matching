"""
UdyamNex — Production Entry Point (Step 6)
==============================================
Aliases the modular FastAPI app from backend.app.main for root-level deployment (Render, Heroku, Docker).
"""

import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app  # noqa: F401
