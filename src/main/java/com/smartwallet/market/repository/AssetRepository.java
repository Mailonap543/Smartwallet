package com.smartwallet.market.repository;

import com.smartwallet.market.entity.Asset;
import com.smartwallet.market.entity.AssetCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("marketAssetRepository")
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    Optional<Asset> findBySymbol(String symbol);
    
    Page<Asset> findAll(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a WHERE LOWER(a.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Asset> search(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a WHERE a.category = :category")
    Page<Asset> findByCategory(@Param("category") AssetCategory category, Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a WHERE a.category = :category ORDER BY a.dividendYield DESC")
    List<Asset> findByCategoryOrderByDividendYieldDesc(@Param("category") AssetCategory category);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.dividendYield DESC")
    Page<Asset> findTopByOrderByDividendYieldDesc(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.marketCap DESC")
    Page<Asset> findByOrderByMarketCapDesc(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.dayVolume DESC")
    Page<Asset> findTopByOrderByVolumeDesc(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.priceToBook ASC")
    Page<Asset> findLowestPriceToBook(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.roe DESC")
    Page<Asset> findHighestROE(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.revenue DESC")
    Page<Asset> findHighestRevenue(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.netIncome DESC")
    Page<Asset> findHighestNetIncome(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.dayVolume DESC")
    Page<Asset> findHighestVolume(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.changePercent DESC")
    Page<Asset> findTopGainers(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.changePercent ASC")
    Page<Asset> findTopLosers(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a ORDER BY a.dividendYield DESC")
    Page<Asset> findTopByDividendYield(Pageable pageable);
    
    @Query("SELECT a FROM MarketAsset a WHERE a.isTracked = true")
    List<Asset> findByIsTrackedTrue();
    
    @Query("SELECT a FROM MarketAsset a WHERE a.isFeatured = true")
    List<Asset> findByIsFeaturedTrue();
    
    @Query("SELECT a FROM MarketAsset a WHERE a.isFeatured = true")
    List<Asset> findFeatured();
    
    @Query("SELECT a FROM MarketAsset a WHERE a.isTracked = true")
    List<Asset> findAllTracked();
}
