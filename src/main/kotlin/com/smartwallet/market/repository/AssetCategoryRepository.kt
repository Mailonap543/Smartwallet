package com.smartwallet.market.repository

import com.smartwallet.market.model.AssetCategory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AssetCategoryRepository : JpaRepository<AssetCategory, Long> {
    fun findAllByIsActiveTrueOrderByDisplayOrderAsc(): List<AssetCategory>
    fun findByCode(code: String): AssetCategory?
}
