package com.smartwallet.market.service

import com.smartwallet.common.NotFoundException
import com.smartwallet.market.model.MarketAsset
import com.smartwallet.market.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class MarketService(
    private val assetRepo: MarketAssetRepository,
    private val categoryRepo: AssetCategoryRepository,
    private val quoteRepo: QuoteHistoryRepository,
    private val dividendRepo: DividendEventRepository,
    private val earningsRepo: EarningsEventRepository
) {

    @Transactional(readOnly = true)
    fun getAsset(symbol: String): MarketAsset =
        assetRepo.findBySymbolIgnoreCase(symbol) ?: throw NotFoundException("Asset not found: $symbol")

    @Transactional(readOnly = true)
    fun search(query: String?, category: String?, page: Int, size: Int): Page<MarketAsset> {
        val pageable: Pageable = PageRequest.of(page, size)
        val cat = category?.let { categoryRepo.findByCode(it) }

        if (!query.isNullOrBlank()) {
            return assetRepo.findBySymbolContainingIgnoreCaseOrNameContainingIgnoreCase(query, query, pageable)
        }
        return if (cat != null) assetRepo.findByCategoryAndIsActiveTrue(cat, pageable)
        else assetRepo.findAllByIsActiveTrue(pageable)
    }

    @Transactional(readOnly = true)
    fun categories() = categoryRepo.findAllByIsActiveTrueOrderByDisplayOrderAsc()

    @Transactional(readOnly = true)
    fun featured() = assetRepo.findTop20ByIsFeaturedTrueOrderByUpdatedAtDesc()

    @Transactional(readOnly = true)
    fun trending() = assetRepo.findTop20ByDayVolumeNotNullOrderByDayVolumeDesc()

    @Transactional(readOnly = true)
    fun rankings(type: String, page: Int, size: Int): Page<MarketAsset> {
        val pageable = PageRequest.of(page, size)
        val sortFun: (MarketAsset) -> BigDecimal? = when (type.lowercase()) {
            "dividendyield" -> { it -> it.dividendYield }
            "roe" -> { it -> it.roe }
            "price-to-earnings", "pe" -> { it -> it.priceToEarnings }
            "price-to-book", "pb" -> { it -> it.priceToBook }
            "liquidez", "volume" -> { it -> it.dayVolume?.toBigDecimal() }
            else -> { it -> it.marketCap }
        }

        val pageData = assetRepo.findAllByIsActiveTrue(pageable)
        val sorted = pageData.content.sortedByDescending { sortFun(it) }
        return org.springframework.data.domain.PageImpl(sorted, pageable, pageData.totalElements)
    }

    @Transactional(readOnly = true)
    fun quote(symbol: String): MarketAsset {
        return getAsset(symbol)
    }

    @Transactional(readOnly = true)
    fun quotes(symbols: List<String>): List<MarketAsset> {
        return symbols.mapNotNull { assetRepo.findBySymbolIgnoreCase(it) }
    }

    @Transactional(readOnly = true)
    fun dividendHistory(symbol: String) =
        dividendRepo.findTop50ByAssetOrderByEventDateDesc(getAsset(symbol))

    @Transactional(readOnly = true)
    fun earningsHistory(symbol: String) =
        earningsRepo.findTop20ByAssetOrderByEventDateDesc(getAsset(symbol))

    @Transactional(readOnly = true)
    fun priceHistory(symbol: String) =
        quoteRepo.findTop200ByAssetOrderByQuoteDateDesc(getAsset(symbol))
}
