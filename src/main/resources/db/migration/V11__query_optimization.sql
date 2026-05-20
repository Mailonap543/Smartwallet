-- V11: Query optimization and performance

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_wallet_id ON portfolio_assets(wallet_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_wallet_symbol ON portfolio_assets(wallet_id, symbol);

-- Add covering indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_user_covering ON portfolio_assets(wallet_id, symbol, name, current_price);

-- Add partial indexes for active data
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_active ON portfolio_assets(wallet_id) WHERE current_price IS NOT NULL;

-- Add created_at index for sorting
CREATE INDEX IF NOT EXISTS idx_wallets_created ON wallets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_created ON portfolio_assets(created_at DESC);
DO $$
BEGIN
    IF to_regclass('public.notifications') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
    END IF;
END $$;

-- Analyze tables for query planner
ANALYZE users;
ANALYZE wallets;
ANALYZE portfolio_assets;
ANALYZE transactions;
DO $$
BEGIN
    IF to_regclass('public.notifications') IS NOT NULL THEN
        ANALYZE notifications;
    END IF;
END $$;
