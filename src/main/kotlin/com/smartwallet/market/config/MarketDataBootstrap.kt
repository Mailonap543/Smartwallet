package com.smartwallet.market.config

import com.smartwallet.market.model.AssetCategory
import com.smartwallet.market.model.MarketAsset
import com.smartwallet.market.repository.AssetCategoryRepository
import com.smartwallet.market.repository.MarketAssetRepository
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.math.BigDecimal

@Configuration
@Profile("dev")
class MarketDataBootstrap(
    private val categoryRepo: AssetCategoryRepository,
    private val assetRepo: MarketAssetRepository
) {
    private val log = LoggerFactory.getLogger(MarketDataBootstrap::class.java)

    @PostConstruct
    fun seed() {
        if (assetRepo.count() > 0) return
        log.info("Seeding minimal market data for dev profile")

        val stock = categoryRepo.save(AssetCategory(code = "STOCK", name = "Ações", isActive = true))
        val fii = categoryRepo.save(AssetCategory(code = "FII", name = "FIIs", isActive = true))

        assetRepo.saveAll(
            listOf(
                MarketAsset(symbol = "PETR4", name = "Petrobras PN", category = stock, currentPrice = BigDecimal("38.50"), changePercent = BigDecimal("1.25"), dayVolume = 12000000, marketCap = BigDecimal("500000000000")),
                MarketAsset(symbol = "VALE3", name = "Vale ON", category = stock, currentPrice = BigDecimal("68.90"), changePercent = BigDecimal("-0.80"), dayVolume = 9000000, marketCap = BigDecimal("600000000000")),
                MarketAsset(symbol = "HGLG11", name = "CSHG Logistica FII", category = fii, currentPrice = BigDecimal("165.20"), changePercent = BigDecimal("0.35"), dayVolume = 120000)
            )
        )
    }
}
