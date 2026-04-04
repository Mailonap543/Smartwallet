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

    List<Asset> findByWalletUserId(Long userId);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.wallet.user.id = :userId")
    int countByUserId(Long userId);

    boolean existsByWalletIdAndSymbol(Long walletId, String symbol);
}