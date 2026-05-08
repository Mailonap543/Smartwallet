package com.smartwallet.ai.chat

/**
 * Cliente que fala com o serviço Python (no futuro).
 * Hoje implementamos um mock para garantir que tudo funcione ponta-a-ponta.
 */
interface PythonAiClient {
    fun generateChatResponse(request: JarvisChatRequest, context: JarvisChatContext): JarvisChatResponse
}

