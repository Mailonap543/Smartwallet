from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
import os

class NotificationType(Enum):
    ALERTA = "alerta"
    OPORTUNIDADE = "oportunidade"
    ANALISE = "analise"
    RECOMENDACAO = "recomendacao"
    RISCO = "risco"

@dataclass
class Notification:
    id: str
    type: NotificationType
    titulo: str
    mensagem: str
    priority: int
    lida: bool = False
    timestamp: datetime = None
    dados: Dict = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.dados is None:
            self.dados = {}

class WhatsAppNotifier:
    def __init__(self):
        self.api_key = os.getenv("WHATSAPP_API_KEY")
        self.phone_number = os.getenv("WHATSAPP_PHONE", "")
        self.notifications_store = {}

    def send_notification(self, phone: str, notification: Notification) -> bool:
        try:
            mensagem = self._format_message(notification)
            self._simulate_send(phone, mensagem)
            self._store_notification(notification)
            return True
        except Exception as e:
            print(f"Erro ao enviar WhatsApp: {e}")
            return False

    def send_alert(self, phone: str, titulo: str, mensagem: str, dados: Dict = None) -> bool:
        notification = Notification(
            id=f"alert_{datetime.now().timestamp()}",
            type=NotificationType.ALERTA,
            titulo=titulo,
            mensagem=mensagem,
            priority=9,
            dados=dados or {}
        )
        return self.send_notification(phone, notification)

    def send_opportunity(self, phone: str, titulo: str, mensagem: str, dados: Dict = None) -> bool:
        notification = Notification(
            id=f"opp_{datetime.now().timestamp()}",
            type=NotificationType.OPORTUNIDADE,
            titulo=titulo,
            mensagem=mensagem,
            priority=6,
            dados=dados or {}
        )
        return self.send_notification(phone, notification)

    def _format_message(self, notification: Notification) -> str:
        emoji = self._get_emoji(notification.type)
        mensagem = f"{emoji} *{notification.titulo}*\n\n{notification.mensagem}"
        if notification.dados:
            mensagem += "\n\n_Dados:_\n"
            for chave, valor in notification.dados.items():
                mensagem += f"• {chave}: {valor}\n"
        return mensagem

    def _get_emoji(self, notification_type: NotificationType) -> str:
        emojis = {
            NotificationType.ALERTA: "🚨",
            NotificationType.OPORTUNIDADE: "⚡",
            NotificationType.ANALISE: "📊",
            NotificationType.RECOMENDACAO: "💡",
            NotificationType.RISCO: "⚠️"
        }
        return emojis.get(notification_type, "📱")

    def _simulate_send(self, phone: str, mensagem: str):
        print(f"[WhatsApp] Para: {phone}")
        print(f"[WhatsApp] Mensagem: {mensagem}")

    def _store_notification(self, notification: Notification):
        self.notifications_store[notification.id] = asdict(notification)

    def get_notifications(self, limit: int = 50) -> List[Dict]:
        notifications = list(self.notifications_store.values())
        return sorted(notifications, key=lambda x: x['timestamp'], reverse=True)[:limit]

    def mark_as_read(self, notification_id: str) -> bool:
        if notification_id in self.notifications_store:
            self.notifications_store[notification_id]['lida'] = True
            return True
        return False

    def get_unread_count(self) -> int:
        return sum(1 for n in self.notifications_store.values() if not n['lida'])
