from __future__ import annotations

import json
import math
import os
import sqlite3
import threading
import time
from typing import Any, Dict, List, Optional

try:
    import numpy as np

    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

def _cosine(a: List[float], b: List[float]) -> float:
    if NUMPY_AVAILABLE:
        va = np.asarray(a, dtype=np.float32)
        vb = np.asarray(b, dtype=np.float32)
        denom = float(np.linalg.norm(va) * np.linalg.norm(vb)) or 1e-9
        return float(np.dot(va, vb) / denom)
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a)) or 1e-9
    nb = math.sqrt(sum(y * y for y in b)) or 1e-9
    return dot / (na * nb)

class LongTermMemory:
    def __init__(
        self,
        db_path: str = "data/jarvis_ltm.sqlite",
        embed_model: str = "text-embedding-3-small",
        min_chars: int = 12,
    ) -> None:
        os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
        self.db_path = db_path
        self.embed_model = embed_model
        self.min_chars = min_chars
        self._lock = threading.Lock()
        self._init_db()
        self._client = self._build_client()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS memories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    text TEXT NOT NULL,
                    embedding TEXT NOT NULL,
                    metadata TEXT,
                    created_at REAL NOT NULL
                )
                """
            )
            conn.execute("CREATE INDEX IF NOT EXISTS idx_mem_session ON memories(session_id)")
            conn.commit()

    def _build_client(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None
        try:
            from openai import OpenAI

            return OpenAI(api_key=api_key)
        except ImportError:
            return None

    def is_enabled(self) -> bool:
        return self._client is not None

    def embed(self, text: str) -> Optional[List[float]]:
        if not self._client or not text or len(text) < self.min_chars:
            return None
        try:
            resp = self._client.embeddings.create(model=self.embed_model, input=text[:8000])
            return list(resp.data[0].embedding)
        except Exception:
            return None

    def add(
        self,
        session_id: str,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> bool:
        vec = self.embed(text)
        if vec is None:
            return False
        with self._lock, sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO memories(session_id, text, embedding, metadata, created_at) VALUES(?,?,?,?,?)",
                (
                    session_id,
                    text,
                    json.dumps(vec),
                    json.dumps(metadata or {}),
                    time.time(),
                ),
            )
            conn.commit()
        return True

    def recall(self, session_id: str, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        if not query:
            return []
        qvec = self.embed(query)
        if qvec is None:
            return []
        with sqlite3.connect(self.db_path) as conn:
            rows = conn.execute(
                "SELECT id, text, embedding, metadata, created_at FROM memories WHERE session_id = ?",
                (session_id,),
            ).fetchall()
        scored = []
        for row in rows:
            try:
                vec = json.loads(row[2])
            except Exception:
                continue
            scored.append((_cosine(qvec, vec), row))
        scored.sort(key=lambda x: x[0], reverse=True)
        out: List[Dict[str, Any]] = []
        for score, row in scored[:top_k]:
            out.append(
                {
                    "id": row[0],
                    "text": row[1],
                    "metadata": json.loads(row[3] or "{}"),
                    "created_at": row[4],
                    "similarity": round(float(score), 4),
                }
            )
        return out

    def prune(self, session_id: str, keep_last: int = 1000) -> int:
        with self._lock, sqlite3.connect(self.db_path) as conn:
            cur = conn.execute(
                "DELETE FROM memories WHERE session_id = ? AND id NOT IN "
                "(SELECT id FROM memories WHERE session_id = ? ORDER BY created_at DESC LIMIT ?)",
                (session_id, session_id, keep_last),
            )
            conn.commit()
            return cur.rowcount or 0