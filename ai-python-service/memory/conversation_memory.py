from datetime import datetime, timedelta
from typing import List, Optional, Dict
from dataclasses import dataclass
import json

@dataclass
class ConversationMessage:
    role: str
    content: str
    timestamp: datetime
    intent: Optional[str] = None
    sentiment: Optional[str] = None
    context_snapshot: Optional[Dict] = None

class ConversationMemory:
    def __init__(self, max_history: int = 100, retention_days: int = 180):
        self.conversations = {}
        self.max_history = max_history
        self.retention_days = retention_days
        self.session_metadata = {}

    def add_message(self, session_id: str, role: str, content: str,
                   intent: Optional[str] = None,
                   sentiment: Optional[str] = None,
                   context: Optional[Dict] = None):
        if session_id not in self.conversations:
            self.conversations[session_id] = []
            self.session_metadata[session_id] = {
                "created_at": datetime.now(),
                "last_interaction": datetime.now(),
                "message_count": 0
            }

        message = ConversationMessage(
            role=role,
            content=content,
            timestamp=datetime.now(),
            intent=intent,
            sentiment=sentiment,
            context_snapshot=context
        )

        self.conversations[session_id].append(message)
        self.session_metadata[session_id]["last_interaction"] = datetime.now()
        self.session_metadata[session_id]["message_count"] += 1

        if len(self.conversations[session_id]) > self.max_history:
            self.conversations[session_id] = self.conversations[session_id][-self.max_history:]

    def get_conversation_context(self, session_id: str) -> List[Dict]:
        if session_id not in self.conversations:
            return []
        return [{
            "role": msg.role,
            "content": msg.content,
            "intent": msg.intent,
            "sentiment": msg.sentiment,
            "timestamp": msg.timestamp.isoformat()
        } for msg in self.conversations[session_id]]

    def get_session_summary(self, session_id: str) -> Dict:
        if session_id not in self.conversations:
            return {}
        messages = self.conversations[session_id]
        metadata = self.session_metadata[session_id]
        return {
            "session_id": session_id,
            "total_messages": len(messages),
            "created_at": metadata["created_at"].isoformat(),
            "last_interaction": metadata["last_interaction"].isoformat()
        }

    def get_user_insights(self, session_id: str) -> Dict:
        if session_id not in self.conversations:
            return {}
        messages = self.conversations[session_id]
        user_messages = [m for m in messages if m.role == "user"]
        return {
            "total_user_messages": len(user_messages),
            "session_duration_minutes": 0
        }
