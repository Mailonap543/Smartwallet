package com.smartwallet.repository;

import com.smartwallet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByCpf(String cpf);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    @Query("SELECT COUNT(w) FROM Wallet w WHERE w.user.id = :userId")
    int countWalletsByUserId(Long userId);

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.wallet.user.id = :userId")
    int countAssetsByUserId(Long userId);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String token);
    Optional<User> findByCpf(String cpf);
}