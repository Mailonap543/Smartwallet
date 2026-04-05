package com.smartwallet.repository;

import com.smartwallet.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByAssetId(Long assetId);
    
    @Query("SELECT t FROM Transaction t WHERE t.asset.id = :assetId ORDER BY t.transactionDate DESC")
    List<Transaction> findByAssetIdOrderedByDateDesc(Long assetId);
    
    @Query("SELECT t FROM Transaction t WHERE t.asset.wallet.user.id = :userId ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserId(Long userId);
    
    @Query("SELECT t FROM Transaction t WHERE t.asset.wallet.user.id = :userId AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.asset.id = :assetId AND t.transactionType = :type ORDER BY t.transactionDate DESC")
    List<Transaction> findByAssetIdAndType(Long assetId, Transaction.TransactionType type);
}