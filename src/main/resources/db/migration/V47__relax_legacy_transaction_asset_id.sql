-- Older Kotlin portfolio models created a second transaction asset link
-- named asset_id. The active Java transaction entity uses portfolio_asset_id.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'transactions'
          AND column_name = 'asset_id'
    ) THEN
        ALTER TABLE transactions ALTER COLUMN asset_id DROP NOT NULL;
    END IF;
END $$;
