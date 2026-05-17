package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.ai.chat.JarvisChatRequest
import com.smartwallet.ai.chat.JarvisChatResponse
import com.smartwallet.ai.chat.JarvisChatService
import com.smartwallet.ai.model.*
import com.smartwallet.entity.Asset
import com.smartwallet.entity.AssetType
import com.smartwallet.entity.User
import com.smartwallet.entity.Wallet
import com.smartwallet.config.security.JwtUtils
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.WalletRepository
import com.smartwallet.security.CustomUserDetails
import com.smartwallet.security.CustomUserDetailsService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@WebMvcTest(AiController::class)
@AutoConfigureMockMvc(addFilters = false)
@Disabled("Covered by AiControllerUnitTest; application-level JPA repository scanning breaks the MVC slice")
class AiControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var aiService: AIService

    @MockBean
    private lateinit var walletRepository: WalletRepository

    @MockBean
    private lateinit var assetRepository: AssetRepository

    @MockBean
    private lateinit var jarvisChatService: JarvisChatService

    @MockBean
    private lateinit var jwtUtils: JwtUtils

    @MockBean
    private lateinit var customUserDetailsService: CustomUserDetailsService

    private lateinit var userDetails: CustomUserDetails

    @BeforeEach
    fun setup() {
        userDetails = CustomUserDetails(createUser())
    }

    @Test
    fun `analyze endpoint returns analysis result`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/analyze")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
    }

    @Test
    fun `risk endpoint returns risk metrics`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/risk")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
    }

    @Test
    fun `score endpoint returns score metrics`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/score")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
    }

    @Test
    fun `recommendations endpoint returns list`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/recommendations")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
    }

    @Test
    fun `chat endpoint returns jarvis response`() {
        val chatRequest = """
            {
                "message": "What is my risk?",
                "sessionId": "test-session"
            }
        """.trimIndent()

        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())
        whenever(jarvisChatService.chat(any(), any())).thenReturn(
            JarvisChatResponse(reply = "Your risk is moderate", sessionId = "test-session")
        )

        mockMvc.perform(post("/api/ai/chat")
            .contentType(MediaType.APPLICATION_JSON)
            .content(chatRequest))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
    }

    private fun createSampleWallets(): List<Wallet> {
        return listOf(
            Wallet().apply {
                id = 1L
                name = "Retirement"
                description = "Retirement portfolio"
                totalBalance = BigDecimal("11000")
                totalInvested = BigDecimal("10000")
                totalProfitLoss = BigDecimal("1000")
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        )
    }

    private fun createSampleAssets(): List<Asset> {
        return listOf(
            Asset().apply {
                symbol = "AAPL"
                name = "Apple"
                quantity = BigDecimal("10")
                purchasePrice = BigDecimal("140")
                averagePrice = BigDecimal("140")
                currentPrice = BigDecimal("150")
                currentValue = BigDecimal("1500")
                profitLoss = BigDecimal("100")
                assetType = AssetType.STOCK
                purchaseDate = LocalDate.now()
            }
        )
    }

    private fun createUser(): User = User().apply {
        id = 1L
        email = "test@example.com"
        passwordHash = "password"
        fullName = "Test User"
        isActive = true
        emailVerified = true
        role = "USER"
    }

    private fun createAnalysisResult(): AIService.AnalysisResult {
        return AIService.AnalysisResult(
            riskMetrics = RiskMetrics(
                portfolioVolatility = BigDecimal("15.0"),
                sharpeRatio = BigDecimal("0.8"),
                beta = BigDecimal("1.1"),
                maxDrawdown = BigDecimal("8.0"),
                var95 = BigDecimal("3.0"),
                riskScore = 50,
                riskLevel = RiskLevel.MODERATE
            ),
            score = ScoreMetrics(
                overallScore = 75,
                diversificationScore = 35,
                riskReturnScore = 60,
                liquidityScore = 40,
                concentrationScore = 70,
                stabilityScore = 65,
                recommendations = listOf("Diversify")
            ),
            recommendations = listOf(
                Recommendation(
                    type = RecommendationType.HOLD,
                    title = "Hold",
                    description = "Hold position",
                    priority = 999,
                    potentialImpact = null,
                    actionRequired = "Monitor"
                )
            )
        )
    }
}
