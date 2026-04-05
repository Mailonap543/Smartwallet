package com.smartwallet.repository;

import com.smartwallet.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    List<Wallet> findByUserId(Long userId);

    Optional<Wallet> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndName(Long userId, String name);

    long countByUserId(Long userId);
    
    List<Wallet> findByUserId(Long userId);
    
    Optional<Wallet> findByIdAndUserId(Long id, Long userId);
    
    boolean existsByIdAndUserId(Long id, Long userId);
    
    @Query("SELECT w FROM Wallet w LEFT JOIN FETCH w WHERE w.user.id = :userId")
    List<Wallet> findByUserIdWithAssets(Long userId);
}