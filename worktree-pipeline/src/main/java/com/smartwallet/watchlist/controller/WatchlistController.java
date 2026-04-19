package com.smartwallet.watchlist.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.entity.Asset;
import com.smartwallet.repository.AssetRepository;
import com.smartwallet.watchlist.entity.Watchlist;
import com.smartwallet.watchlist.entity.WatchlistItem;
import com.smartwallet.watchlist.repository.WatchlistItemRepository;
import com.smartwallet.watchlist.repository.WatchlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/watchlist")
public class WatchlistController {

    private final WatchlistRepository watchlistRepository;
    private final WatchlistItemRepository itemRepository;
    private final AssetRepository assetRepository;

    public WatchlistController(WatchlistRepository watchlistRepository,
                          WatchlistItemRepository itemRepository,
                          AssetRepository assetRepository) {
        this.watchlistRepository = watchlistRepository;
        this.itemRepository = itemRepository;
        this.assetRepository = assetRepository;
    }

    private Long getCurrentUserId() {
        return 1L;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Watchlist>>> getWatchlists() {
        Long userId = getCurrentUserId();
        List<Watchlist> watchlists = watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(ApiResponse.success(watchlists));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Watchlist>> createWatchlist(@RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        String name = body.get("name");
        
        Watchlist watchlist = new Watchlist();
        watchlist.setUserId(userId);
        watchlist.setName(name);
        
        watchlist = watchlistRepository.save(watchlist);
        return ResponseEntity.ok(ApiResponse.success(watchlist));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWatchlist(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        watchlistRepository.findByIdAndUserId(id, userId).ifPresent(w -> {
            itemRepository.deleteByWatchlistId(id);
            watchlistRepository.delete(w);
        });
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<Asset>>> getWatchlistItems(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        List<WatchlistItem> items = itemRepository.findByWatchlistIdOrderByPositionAsc(id);
        
        List<Asset> assets = items.stream()
            .map(item -> assetRepository.findBySymbol(item.getAssetSymbol()).orElse(null))
            .filter(a -> a != null)
            .toList();
        
        return ResponseEntity.ok(ApiResponse.success(assets));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<WatchlistItem>> addItem(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String symbol = body.get("symbol").toUpperCase();
        
        if (itemRepository.existsByWatchlistIdAndAssetSymbol(id, symbol)) {
            return ResponseEntity.badRequest().build();
        }
        
        WatchlistItem item = new WatchlistItem();
        item.setWatchlistId(id);
        item.setAssetSymbol(symbol);
        
        long count = itemRepository.countByWatchlistId(id);
        item.setPosition((int) count + 1);
        
        item = itemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @DeleteMapping("/{id}/items/{symbol}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable Long id, @PathVariable String symbol) {
        itemRepository.findByWatchlistIdAndAssetSymbol(id, symbol.toUpperCase())
            .ifPresent(itemRepository::delete);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/favorite/{symbol}")
    public ResponseEntity<ApiResponse<WatchlistItem>> addFavorite(@PathVariable String symbol) {
        Long userId = getCurrentUserId();
        Watchlist defaultList = watchlistRepository.findByUserIdAndIsDefaultTrue(userId)
            .orElseGet(() -> {
                Watchlist w = new Watchlist();
                w.setUserId(userId);
                w.setName("Favoritos");
                w.setDefault(true);
                return watchlistRepository.save(w);
            });
        
        WatchlistItem item = new WatchlistItem();
        item.setWatchlistId(defaultList.getId());
        item.setAssetSymbol(symbol.toUpperCase());
        item.setPosition(1);
        
        item = itemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @DeleteMapping("/favorite/{symbol}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable String symbol) {
        Long userId = getCurrentUserId();
        watchlistRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(watchlist -> {
            itemRepository.findByWatchlistIdAndAssetSymbol(watchlist.getId(), symbol.toUpperCase())
                .ifPresent(itemRepository::delete);
        });
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<Asset>>> getFavorites() {
        Long userId = getCurrentUserId();
        Optional<Watchlist> watchlistOpt = watchlistRepository.findByUserIdAndIsDefaultTrue(userId);
        
        if (watchlistOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        
        List<WatchlistItem> items = itemRepository.findByWatchlistIdOrderByPositionAsc(watchlistOpt.get().getId());
        List<Asset> assets = items.stream()
            .map(item -> assetRepository.findBySymbol(item.getAssetSymbol()).orElse(null))
            .filter(a -> a != null)
            .toList();
        
        return ResponseEntity.ok(ApiResponse.success(assets));
    }
}
