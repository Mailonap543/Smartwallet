-- Rename portfolio assets table to avoid conflict with market assets
ALTER TABLE IF EXISTS assets RENAME TO portfolio_assets;

-- Update foreign key in transactions
ALTER TABLE IF EXISTS transactions DROP CONSTRAINT IF EXISTS transactions_asset_id_fkey;
ALTER TABLE IF EXISTS transactions
    ADD CONSTRAINT transactions_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES portfolio_assets(id) ON DELETE CASCADE;

-- Update indexes if they existed
DROP INDEX IF EXISTS idx_assets_wallet_id;
DROP INDEX IF EXISTS idx_assets_symbol;
DROP INDEX IF EXISTS idx_assets_type;

CREATE INDEX IF NOT EXISTS idx_portfolio_assets_wallet_id ON portfolio_assets(wallet_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_symbol ON portfolio_assets(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_type ON portfolio_assets(asset_type);
