package com.smartwallet.market.repository

import com.smartwallet.market.model.MarketAsset
import com.smartwallet.market.model.QuoteHistory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface QuoteHistoryRepository : JpaRepository<QuoteHistory, Long> {
    fun findTop200ByAssetOrderByQuoteDateDesc(asset: MarketAsset): List<QuoteHistory>
}
