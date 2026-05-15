package com.smartwallet

import com.smartwallet.ai.AIServiceTest
import com.smartwallet.ai.chat.JarvisChatModelsTest
import com.smartwallet.ai.chat.JarvisChatServiceTest
import com.smartwallet.ai.chat.JarvisReplyBuilderTest
import com.smartwallet.ai.ml.MLPredictionServiceTest
import com.smartwallet.ai.model.ModelsTest
import com.smartwallet.ai.service.PortfolioScoringServiceTest
import com.smartwallet.ai.service.RecommendationEngineTest
import com.smartwallet.ai.service.RiskAnalysisServiceTest
import com.smartwallet.ai.web.AiControllerUnitTest
import com.smartwallet.service.HealthServiceTest
import com.smartwallet.service.TransactionServiceTest
import org.junit.platform.suite.api.SelectClasses
import org.junit.platform.suite.api.Suite
import org.junit.platform.suite.api.SuiteDisplayName

@Suite
@SuiteDisplayName("SmartWallet AI Service Tests")
@SelectClasses(
    value = [
        RiskAnalysisServiceTest::class,
        PortfolioScoringServiceTest::class,
        RecommendationEngineTest::class,
        AIServiceTest::class,
        MLPredictionServiceTest::class,
        ModelsTest::class,
        JarvisChatModelsTest::class,
        JarvisChatServiceTest::class,
        JarvisReplyBuilderTest::class,
        AiControllerUnitTest::class,
        HealthServiceTest::class,
        TransactionServiceTest::class
    ]
)