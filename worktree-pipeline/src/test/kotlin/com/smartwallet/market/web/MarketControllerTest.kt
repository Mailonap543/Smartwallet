package com.smartwallet.market.web

import com.smartwallet.market.model.AssetCategory
import com.smartwallet.market.model.MarketAsset
import com.smartwallet.market.repository.AssetCategoryRepository
import com.smartwallet.market.repository.MarketAssetRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import java.math.BigDecimal

@SpringBootTest
@AutoConfigureMockMvc
class MarketControllerTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var categoryRepo: AssetCategoryRepository

    @Autowired
    lateinit var assetRepo: MarketAssetRepository

    @BeforeEach
    fun seed() {
        assetRepo.deleteAll()
        categoryRepo.deleteAll()
        val stock = categoryRepo.save(AssetCategory(code = "STOCK", name = "Ações"))
        assetRepo.saveAll(
            listOf(
                MarketAsset(symbol = "PETR4", name = "Petrobras PN", category = stock, currentPrice = BigDecimal("38.50"), changePercent = BigDecimal("1.2"), dayVolume = 1000),
                MarketAsset(symbol = "VALE3", name = "Vale ON", category = stock, currentPrice = BigDecimal("70.00"), changePercent = BigDecimal("-0.5"), dayVolume = 500)
            )
        )
    }

    @Test
    fun `should return featured`() {
        mockMvc.get("/api/market/featured")
            .andExpect {
                status { isOk() }
                content { contentType(MediaType.APPLICATION_JSON) }
            }
    }

    @Test
    fun `should search assets`() {
        mockMvc.get("/api/market/search?q=PETR")
            .andExpect { status { isOk() } }
    }

    @Test
    fun `should get rankings`() {
        mockMvc.get("/api/market/rankings/dividendyield")
            .andExpect { status { isOk() } }
    }
}
