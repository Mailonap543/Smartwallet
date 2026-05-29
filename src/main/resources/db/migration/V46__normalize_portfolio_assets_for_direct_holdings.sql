-- Keeps the old market-asset link optional and makes direct portfolio holdings
-- compatible with the current Asset entity used by the application.

ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS asset_type VARCHAR(20);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS current_price NUMERIC(19, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS average_price NUMERIC(19, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS current_value NUMERIC(19, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS total_invested NUMERIC(19, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS profit_loss NUMERIC(19, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS profit_loss_percentage NUMERIC(7, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS day_high NUMERIC(19, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS day_low NUMERIC(19, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS day_volume BIGINT;
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS market_cap NUMERIC(24, 4);
ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS last_quote_at TIMESTAMP;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'portfolio_assets'
          AND column_name = 'asset_id'
    ) THEN
        UPDATE portfolio_assets pa
        SET symbol = COALESCE(NULLIF(pa.symbol, ''), a.symbol)
        FROM assets a
        WHERE pa.asset_id = a.id
          AND NULLIF(pa.symbol, '') IS NULL;

        UPDATE portfolio_assets pa
        SET name = COALESCE(NULLIF(pa.name, ''), a.name)
        FROM assets a
        WHERE pa.asset_id = a.id
          AND NULLIF(pa.name, '') IS NULL;

        UPDATE portfolio_assets pa
        SET asset_type = COALESCE(NULLIF(pa.asset_type, ''), a.asset_type)
        FROM assets a
        WHERE pa.asset_id = a.id
          AND NULLIF(pa.asset_type, '') IS NULL;

        ALTER TABLE portfolio_assets ALTER COLUMN asset_id DROP NOT NULL;
    END IF;
END $$;

UPDATE portfolio_assets
SET symbol = COALESCE(NULLIF(symbol, ''), 'ASSET-' || id)
WHERE NULLIF(symbol, '') IS NULL;

UPDATE portfolio_assets
SET name = COALESCE(NULLIF(name, ''), symbol)
WHERE NULLIF(name, '') IS NULL;

UPDATE portfolio_assets
SET asset_type = COALESCE(NULLIF(asset_type, ''), 'OTHER')
WHERE NULLIF(asset_type, '') IS NULL;

UPDATE portfolio_assets
SET current_price = COALESCE(current_price, purchase_price)
WHERE current_price IS NULL;

UPDATE portfolio_assets
SET average_price = COALESCE(average_price, purchase_price)
WHERE average_price IS NULL;

UPDATE portfolio_assets
SET total_invested = COALESCE(total_invested, quantity * purchase_price)
WHERE total_invested IS NULL;

UPDATE portfolio_assets
SET current_value = COALESCE(current_value, quantity * current_price)
WHERE current_value IS NULL;

UPDATE portfolio_assets
SET profit_loss = COALESCE(profit_loss, current_value - total_invested)
WHERE profit_loss IS NULL;

UPDATE portfolio_assets
SET profit_loss_percentage = 0
WHERE profit_loss_percentage IS NULL;

ALTER TABLE portfolio_assets ALTER COLUMN symbol SET NOT NULL;
ALTER TABLE portfolio_assets ALTER COLUMN name SET NOT NULL;
ALTER TABLE portfolio_assets ALTER COLUMN asset_type SET NOT NULL;

ALTER TABLE portfolio_assets ALTER COLUMN quantity TYPE NUMERIC(19, 8);
ALTER TABLE portfolio_assets ALTER COLUMN purchase_price TYPE NUMERIC(19, 4);
ALTER TABLE portfolio_assets ALTER COLUMN current_price TYPE NUMERIC(19, 4);
ALTER TABLE portfolio_assets ALTER COLUMN average_price TYPE NUMERIC(19, 4);
