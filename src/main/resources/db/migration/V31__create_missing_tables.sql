-- Create watchlists table if not exists
CREATE TABLE IF NOT EXISTS watchlists (
                                          id BIGSERIAL PRIMARY KEY,
                                          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

-- Create alerts table if not exists
CREATE TABLE IF NOT EXISTS alerts (
                                      id BIGSERIAL PRIMARY KEY,
                                      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    target_value NUMERIC(19, 4),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_asset_symbol ON alerts(asset_symbol);

-- Create quote_history table if not exists
CREATE TABLE IF NOT EXISTS quote_history (
                                             id BIGSERIAL PRIMARY KEY,
                                             asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    quote_date DATE NOT NULL,
    open_price NUMERIC(19, 4),
    high_price NUMERIC(19, 4),
    low_price NUMERIC(19, 4),
    close_price NUMERIC(19, 4) NOT NULL,
    volume BIGINT,
    adjusted_close NUMERIC(19, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_quote_history_asset_id ON quote_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_quote_history_date ON quote_history(quote_date);

-- Create news_items table if not exists
CREATE TABLE IF NOT EXISTS news_items (
                                          id BIGSERIAL PRIMARY KEY,
                                          title VARCHAR(255) NOT NULL,
    summary TEXT,
    source VARCHAR(255) NOT NULL,
    published_at TIMESTAMP NOT NULL,
    url VARCHAR(500),
    symbols VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items(published_at);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
                                             id BIGSERIAL PRIMARY KEY,
                                             user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);