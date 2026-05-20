-- Create dividend_events table
CREATE TABLE IF NOT EXISTS dividend_events (
                                               id BIGSERIAL PRIMARY KEY,
                                               asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    payment_date DATE,
    dividend_type VARCHAR(50),
    dividend_amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    is_exclusive BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_dividend_events_asset_id ON dividend_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_dividend_events_event_date ON dividend_events(event_date);
