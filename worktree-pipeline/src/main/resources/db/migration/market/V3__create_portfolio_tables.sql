-- Portfolio tables (additional to existing)
-- Goals
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    wallet_id BIGINT,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(18,2) NOT NULL,
    current_amount DECIMAL(18,2) DEFAULT 0,
    target_date DATE,
    category VARCHAR(100),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_user_id ON goals(user_id);

-- Dividends received
CREATE TABLE IF NOT EXISTS dividend_receipts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    wallet_id BIGINT NOT NULL,
    asset_symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(18,4) NOT NULL,
    quantity DECIMAL(18,4) NOT NULL,
    price_per_share DECIMAL(18,4),
    payment_date DATE NOT NULL,
    ex_date DATE,
    currency VARCHAR(10) DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dividends_user_id ON dividend_receipts(user_id);
CREATE INDEX idx_dividends_wallet_id ON dividend_receipts(wallet_id);
CREATE INDEX idx_dividends_payment_date ON dividend_receipts(payment_date);

-- Benchmark comparison
CREATE TABLE IF NOT EXISTS benchmark_snapshots (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    benchmark_type VARCHAR(50) NOT NULL,
    portfolio_value DECIMAL(18,2) NOT NULL,
    benchmark_value DECIMAL(18,2) NOT NULL,
    period_days INT NOT NULL,
    portfolio_return DECIMAL(8,4),
    benchmark_return DECIMAL(8,4),
    alpha DECIMAL(8,4),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_benchmark_user_id ON benchmark_snapshots(user_id);
CREATE INDEX idx_benchmark_recorded_at ON benchmark_snapshots(recorded_at);