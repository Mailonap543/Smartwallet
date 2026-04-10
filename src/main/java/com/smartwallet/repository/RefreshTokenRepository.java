package com.smartwallet.repository;

import com.smartwallet.entity.RefreshToken;
import com.smartwallet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    
    @Modifying
    @Query("UPDATE RefreshToken r SET r.isRevoked = true WHERE r.user = :user AND r.isRevoked = false")
    void revokeAllByUser(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now OR r.isRevoked = true")
    void deleteExpiredAndRevokedTokens(java.time.LocalDateTime now);
}