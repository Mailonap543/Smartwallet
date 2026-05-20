-- Create watchlist_items table
CREATE TABLE IF NOT EXISTS watchlist_items (
                                               id BIGSERIAL PRIMARY KEY,
                                               watchlist_id BIGINT NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_asset_symbol ON watchlist_items(asset_symbol);
