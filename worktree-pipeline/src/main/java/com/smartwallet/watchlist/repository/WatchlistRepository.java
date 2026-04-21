package com.smartwallet.watchlist.repository;

import com.smartwallet.watchlist.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Watchlist> findByUserIdAndIsDefaultTrue(Long userId);
    Optional<Watchlist> findByIdAndUserId(Long id, Long userId);
}