-- V1__create_market_tables.sql
-- Asset Categories and Market Data Tables

-- Asset Categories
CREATE TABLE asset_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets (Market Data)
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    isin VARCHAR(20) UNIQUE,
    category_id BIGINT REFERENCES asset_categories(id),
    segment VARCHAR(100),
    sub_segment VARCHAR(100),
    company_name VARCHAR(200),
    logo_url VARCHAR(500),
    website VARCHAR(500),
    description TEXT,
    current_price DECIMAL(19, 4),
    previous_close DECIMAL(19, 4),
    change_percent DECIMAL(8, 2),
    day_high DECIMAL(19, 4),
    day_low DECIMAL(19, 4),
    day_volume BIGINT,
    market_cap DECIMAL(20, 2),
    price_to_earnings DECIMAL(10, 2),
    price_to_book DECIMAL(10, 2),
    dividend_yield DECIMAL(8, 2),
    roe DECIMAL(8, 2),
    revenue DECIMAL(20, 2),
    net_income DECIMAL(20, 2),
    total_debt DECIMAL(20, 2),
    cash DECIMAL(20, 2),
    high_52w DECIMAL(19, 4),
    low_52w DECIMAL(19, 4),
    is_tracked BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    last_quote_at TIMESTAMP,
    data_source VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_asset_symbol ON assets(symbol);
CREATE INDEX idx_asset_category ON assets(category_id);
CREATE INDEX idx_asset_isin ON assets(isin);
CREATE INDEX idx_asset_name ON assets(name);
CREATE INDEX idx_asset_tracked ON assets(is_tracked) WHERE is_tracked = TRUE;
CREATE INDEX idx_asset_featured ON assets(is_featured) WHERE is_featured = TRUE;

-- Quote History (time series)
CREATE TABLE quote_history (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id),
    quote_date DATE NOT NULL,
    open_price DECIMAL(19, 4),
    high_price DECIMAL(19, 4),
    low_price DECIMAL(19, 4),
    close_price DECIMAL(19, 4) NOT NULL,
    volume BIGINT,
    adjusted_close DECIMAL(19, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, quote_date)
);

CREATE INDEX idx_quote_history_asset_date ON quote_history(asset_id, quote_date DESC);

-- Dividend Events
CREATE TABLE dividend_events (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id),
    event_date DATE NOT NULL,
    payment_date DATE,
    dividend_type VARCHAR(20),
    dividend_amount DECIMAL(15, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    is_exclusive BOOLEAN DEFAULT FALSE,
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dividend_events_asset_date ON dividend_events(asset_id, event_date DESC);

-- Earnings Events (results)
CREATE TABLE earnings_events (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id),
    period VARCHAR(10) NOT NULL,
    event_date DATE NOT NULL,
    revenue DECIMAL(20, 2),
    net_income DECIMAL(20, 2),
    earnings_per_share DECIMAL(10, 4),
    expected_eps DECIMAL(10, 4),
    currency VARCHAR(3) DEFAULT 'BRL',
    notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_earnings_events_asset_date ON earnings_events(asset_id, event_date DESC);

-- Insert default categories
INSERT INTO asset_categories (code, name, description, display_order) VALUES
('STOCK', 'Ações', 'Ações negociadas na B3', 1),
('FII', 'FIIs', 'Fundos Imobiliários', 2),
('ETF', 'ETFs', 'Exchange Traded Funds', 3),
('BDR', 'BDRs', 'Brazilian Depositary Receipts', 4),
('REIT', 'REITs', 'Real Estate Investment Trusts (internacionais)', 5),
('CRYPTO', 'Criptomoedas', 'Criptomoedas e tokens', 6),
('FIXED', 'Renda Fixa', 'Títulos de renda fixa', 7),
('INDEX', 'Índices', 'Índices de mercado', 8),
('COMMODITY', 'Commodities', ' commodities', 9),
('CURRENCY', 'Moedas', 'Moedas estrangeiras', 10);