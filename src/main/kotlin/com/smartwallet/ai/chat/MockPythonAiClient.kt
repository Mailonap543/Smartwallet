package com.smartwallet.ai.chat

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(
    name = ["smartwallet.ai.python.mock-enabled"],
    havingValue = "true",
    matchIfMissing = true
)
class MockPythonAiClient : PythonAiClient {

    override fun generateChatResponse(
        request: JarvisChatRequest,
        context: JarvisChatContext
    ): JarvisChatResponse {
        return JarvisReplyBuilder.buildLocal(request, context)
    }
}

