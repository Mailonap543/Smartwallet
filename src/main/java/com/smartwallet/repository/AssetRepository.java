package com.smartwallet.repository;

import com.smartwallet.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    List<Asset> findByWalletId(Long walletId);
    
    Optional<Asset> findByIdAndWalletId(Long id, Long walletId);
    
    boolean existsByIdAndWalletId(Long id, Long walletId);
    
    Optional<Asset> findByWalletIdAndSymbol(Long walletId, String symbol);
    
    @Query("SELECT a FROM Asset a WHERE a.wallet.user.id = :userId")
    List<Asset> findByUserId(Long userId);
    
    @Query("SELECT a FROM Asset a WHERE a.wallet.user.id = :userId AND a.assetType = :type")
    List<Asset> findByUserIdAndType(Long userId, Asset.AssetType type);
    
    @Query("SELECT DISTINCT a.assetType FROM Asset a WHERE a.wallet.user.id = :userId")
    List<Asset.AssetType> findDistinctTypesByUserId(Long userId);
}