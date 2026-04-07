package com.smartwallet.watchlist.repository;

import com.smartwallet.watchlist.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {
    List<WatchlistItem> findByWatchlistIdOrderByPositionAsc(Long watchlistId);
    Optional<WatchlistItem> findByWatchlistIdAndAssetSymbol(Long watchlistId, String assetSymbol);
    boolean existsByWatchlistIdAndAssetSymbol(Long watchlistId, String assetSymbol);
    long countByWatchlistId(Long watchlistId);
    void deleteByWatchlistId(Long watchlistId);
}