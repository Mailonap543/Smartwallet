-- Add missing columns to assets (market) table from com.smartwallet.market.entity.Asset.java entity
ALTER TABLE assets ADD COLUMN IF NOT EXISTS isin VARCHAR(20) UNIQUE;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS category_id BIGINT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS segment VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS sub_segment VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS previous_close NUMERIC(19, 4);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS change_percent NUMERIC(8, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS price_to_earnings NUMERIC(10, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS price_to_book NUMERIC(10, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS dividend_yield NUMERIC(8, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS roe NUMERIC(8, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS revenue NUMERIC(20, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS net_income NUMERIC(20, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS total_debt NUMERIC(20, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS cash NUMERIC(20, 2);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "52w_high" NUMERIC(19, 4);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS "52w_low" NUMERIC(19, 4);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_tracked BOOLEAN DEFAULT true;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS data_source VARCHAR(255);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add foreign key for category_id if assets table uses asset_categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_assets_category_id'
        AND table_name = 'assets'
    ) THEN
ALTER TABLE assets ADD CONSTRAINT fk_assets_category_id
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL;
END IF;
END $$;
