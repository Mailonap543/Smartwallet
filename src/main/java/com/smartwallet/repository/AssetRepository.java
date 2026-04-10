package com.smartwallet.repository;

import com.smartwallet.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    @Query("SELECT a FROM PortfolioAsset a WHERE a.wallet.user.id = :userId")
    List<Asset> findByUserId(Long userId);
    @Query("SELECT a FROM PortfolioAsset a WHERE a.id = :id AND a.wallet.user.id = :userId")
    Optional<Asset> findByIdAndUserId(Long id, Long userId);
    @Query("SELECT a FROM PortfolioAsset a WHERE a.wallet.user.id = :userId AND a.symbol = :symbol")
    Optional<Asset> findByUserIdAndSymbol(Long userId, String symbol);
    Optional<Asset> findBySymbol(String symbol);
    @Query("SELECT a FROM PortfolioAsset a WHERE a.wallet.id = :walletId AND a.symbol = :symbol")
    Optional<Asset> findByWalletIdAndSymbol(Long walletId, String symbol);
    @Query("SELECT a FROM PortfolioAsset a WHERE a.wallet.id = :walletId")
    List<Asset> findByWalletId(Long walletId);
    @Query("SELECT COUNT(a) FROM PortfolioAsset a WHERE a.wallet.user.id = :userId")
    long countByUserId(Long userId);
}