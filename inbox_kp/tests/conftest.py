from __future__ import annotations

import os
import tempfile
from pathlib import Path

_db = Path(tempfile.gettempdir()) / "inbox-kp-pytest.db"
if _db.exists():
    _db.unlink()
os.environ["INBOX_DB_PATH"] = str(_db)
