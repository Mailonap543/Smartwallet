package com.smartwallet.portfolio.service

import com.smartwallet.market.repository.DividendEventRepository
import com.smartwallet.market.repository.MarketAssetRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

data class ProventoResumo(
    val total: BigDecimal,
    val proximos: Int,
    val historicos: Int
)

@Service
class ProventoService(
    private val dividendRepo: DividendEventRepository,
    private val assetRepo: MarketAssetRepository
) {
    @Transactional(readOnly = true)
    fun resumoPorAtivo(symbol: String): ProventoResumo {
        val asset = assetRepo.findBySymbolIgnoreCase(symbol) ?: return ProventoResumo(
            total = BigDecimal.ZERO,
            proximos = 0,
            historicos = 0
        )
        val events = dividendRepo.findTop50ByAssetOrderByEventDateDesc(asset)
        val total = events.map { it.dividendAmount }.fold(BigDecimal.ZERO, BigDecimal::add)
        return ProventoResumo(total = total, proximos = 0, historicos = events.size)
    }
}
