package com.smartwallet.alert.repository;

import com.smartwallet.alert.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserIdAndIsActiveTrue(Long userId);
    List<Alert> findByUserIdAndAssetSymbol(Long userId, String assetSymbol);
    List<Alert> findByAssetSymbolAndIsActiveTrue(String assetSymbol);
}