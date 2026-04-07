package com.smartwallet.market.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.smartwallet.market.model.AssetCategory
import com.smartwallet.market.model.MarketAsset
import com.smartwallet.market.repository.AssetCategoryRepository
import com.smartwallet.market.repository.MarketAssetRepository
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.core.io.ClassPathResource
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

data class MarketSeedAsset(
    val symbol: String,
    val name: String,
    val category: String,
    val price: BigDecimal,
    val changePercent: BigDecimal? = null,
    val volume: Long? = null,
    val marketCap: BigDecimal? = null
)

@Service
@Profile("dev")
class MarketIngestionService(
    private val categoryRepo: AssetCategoryRepository,
    private val assetRepo: MarketAssetRepository
) {
    private val log = LoggerFactory.getLogger(MarketIngestionService::class.java)
    private val mapper = jacksonObjectMapper()

    @Scheduled(fixedDelay = 15 * 60 * 1000, initialDelay = 5000)
    @Transactional
    fun ingest() {
        val resource = ClassPathResource("data/market_seed.json")
        if (!resource.exists()) return

        val payload: List<MarketSeedAsset> = mapper.readValue(resource.inputStream)
        val categories = categoryRepo.findAll().associateBy { it.code }.toMutableMap()

        payload.forEach { seed ->
            val cat = categories.getOrPut(seed.category) {
                categoryRepo.save(AssetCategory(code = seed.category, name = seed.category))
            }
            val existing = assetRepo.findBySymbolIgnoreCase(seed.symbol)
            val entity = (existing ?: MarketAsset(symbol = seed.symbol, name = seed.name, category = cat)).copy(
                name = seed.name,
                category = cat,
                currentPrice = seed.price,
                changePercent = seed.changePercent,
                dayVolume = seed.volume,
                marketCap = seed.marketCap,
                isActive = true
            )
            assetRepo.save(entity)
        }
        log.info("Market ingestion processed ${payload.size} assets")
    }
}
