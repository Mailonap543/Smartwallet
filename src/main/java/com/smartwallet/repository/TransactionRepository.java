package com.smartwallet.repository;

import com.smartwallet.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT t FROM PortfolioTransaction t WHERE t.asset.wallet.user.id = :userId ORDER BY t.createdAt DESC")
    List<Transaction> findByUserId(Long userId);
    @Query("SELECT t FROM PortfolioTransaction t WHERE t.asset.id = :assetId ORDER BY t.createdAt DESC")
    List<Transaction> findByAssetIdOrderedByDateDesc(Long assetId);
}