package com.smartwallet.ai.chat

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import java.time.Duration

@Component
@ConditionalOnProperty(
    name = ["smartwallet.ai.python.mock-enabled"],
    havingValue = "false"
)
class HttpPythonAiClient(
    webClientBuilder: WebClient.Builder,
    @Value("\${smartwallet.ai.python.base-url:http://localhost:8001}") private val baseUrl: String,
    @Value("\${smartwallet.ai.python.chat-path:/chat}") private val chatPath: String,
    @Value("\${smartwallet.ai.python.timeout-ms:5000}") private val timeoutMs: Long
) : PythonAiClient {

    private val log = LoggerFactory.getLogger(HttpPythonAiClient::class.java)

    private val webClient: WebClient = webClientBuilder
        .baseUrl(baseUrl)
        .build()

    override fun generateChatResponse(request: JarvisChatRequest, context: JarvisChatContext): JarvisChatResponse {
        val payload = PythonJarvisChatRequest(
            message = request.message,
            sessionId = request.sessionId,
            context = context,
            webSearch = request.webSearch
        )

        return try {
            val response = webClient.post()
                .uri(chatPath)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(PythonJarvisChatResponse::class.java)
                .timeout(Duration.ofMillis(timeoutMs))
                .block()

            if (response == null) {
                log.warn("Python AI returned empty response, using local fallback")
                JarvisReplyBuilder.buildLocal(request, context)
            } else {
                JarvisChatResponse(
                    reply = response.reply,
                    sessionId = response.sessionId,
                    googleUrl = response.googleUrl,
                    searchResults = response.searchResults,
                    intent = response.intent,
                    confidence = response.confidence,
                    actions = response.actions,
                    capabilities = response.capabilities
                )
            }
        } catch (ex: Exception) {
            log.warn("Python AI unavailable at {}{}, using fallback. reason={}", baseUrl, chatPath, ex.message)
            JarvisReplyBuilder.buildLocal(request, context)
        }
    }
}

