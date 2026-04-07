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

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Optional<Asset> findBySymbol(String symbol);
    
    Optional<Asset> findByIsin(String isin);
    
    boolean existsBySymbol(String symbol);
    
    @Query("SELECT a FROM Asset a WHERE a.isTracked = true AND a.isActive = true ORDER BY a.symbol")
    List<Asset> findAllTracked();
    
    @Query("SELECT a FROM Asset a WHERE a.isFeatured = true AND a.isActive = true")
    List<Asset> findFeatured();
    
    @Query("SELECT a FROM Asset a WHERE a.category = :category AND a.isActive = true")
    Page<Asset> findByCategory(@Param("category") AssetCategory category, Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE " +
           "(LOWER(a.symbol) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.companyName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND a.isActive = true " +
           "ORDER BY " +
           "CASE WHEN LOWER(a.symbol) = LOWER(:query) THEN 0 " +
           "WHEN LOWER(a.symbol) LIKE LOWER(CONCAT(:query, '%')) THEN 1 " +
           "WHEN LOWER(a.name) LIKE LOWER(CONCAT(:query, '%')) THEN 2 " +
           "ELSE 3 END")
    Page<Asset> search(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM Asset a WHERE a.category = :category AND a.isActive = true")
    long countByCategory(@Param("category") AssetCategory category);

    @Query("SELECT a FROM Asset a WHERE a.dividendYield IS NOT NULL AND a.dividendYield > 0 AND a.isActive = true ORDER BY a.dividendYield DESC")
    Page<Asset> findTopByDividendYield(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.priceToBook IS NOT NULL AND a.priceToBook > 0 AND a.isActive = true ORDER BY a.priceToBook ASC")
    Page<Asset> findLowestPriceToBook(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.roe IS NOT NULL AND a.isActive = true ORDER BY a.roe DESC")
    Page<Asset> findHighestROE(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.revenue IS NOT NULL AND a.isActive = true ORDER BY a.revenue DESC")
    Page<Asset> findHighestRevenue(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.netIncome IS NOT NULL AND a.isActive = true ORDER BY a.netIncome DESC")
    Page<Asset> findHighestNetIncome(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.dayVolume IS NOT NULL AND a.isActive = true ORDER BY a.dayVolume DESC")
    Page<Asset> findHighestVolume(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.changePercent IS NOT NULL AND a.changePercent > 0 AND a.isActive = true ORDER BY a.changePercent DESC")
    Page<Asset> findTopGainers(Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.changePercent IS NOT NULL AND a.changePercent < 0 AND a.isActive = true ORDER BY a.changePercent ASC")
    Page<Asset> findTopLosers(Pageable pageable);
}