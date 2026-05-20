-- Create asset_categories table if not exists (required for assets.category_id foreign key)
CREATE TABLE IF NOT EXISTS asset_categories (
                                                id BIGSERIAL PRIMARY KEY,
                                                code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_asset_categories_code ON asset_categories(code);
CREATE INDEX IF NOT EXISTS idx_asset_categories_is_active ON asset_categories(is_active);