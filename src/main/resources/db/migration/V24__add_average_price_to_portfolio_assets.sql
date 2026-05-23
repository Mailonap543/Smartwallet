ALTER TABLE portfolio_assets
    ALTER COLUMN created_at DROP NOT NULL,
ALTER COLUMN updated_at DROP NOT NULL;

ALTER TABLE portfolio_assets
    ADD COLUMN IF NOT EXISTS average_price NUMERIC(19, 4);

ALTER TABLE portfolio_assets
    ADD COLUMN IF NOT EXISTS current_price NUMERIC(15,2);

ALTER TABLE portfolio_assets ALTER COLUMN quantity TYPE NUMERIC(18,8);
ALTER TABLE portfolio_assets ALTER COLUMN purchase_price TYPE NUMERIC(15,2);
ALTER TABLE portfolio_assets ALTER COLUMN current_price TYPE NUMERIC(15,2);