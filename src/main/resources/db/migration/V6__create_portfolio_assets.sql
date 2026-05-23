CREATE TABLE IF NOT EXISTS portfolio_assets (
                                                id BIGSERIAL PRIMARY KEY,
                                                wallet_id BIGINT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    quantity DECIMAL(18, 8) NOT NULL,
    purchase_price DECIMAL(15, 2) NOT NULL,
    current_price DECIMAL(15, 2),
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_portfolio_assets_wallet_id ON portfolio_assets(wallet_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_asset_id ON portfolio_assets(asset_id);