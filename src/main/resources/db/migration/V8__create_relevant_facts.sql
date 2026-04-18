CREATE TABLE IF NOT EXISTS relevant_facts (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES portfolio_assets(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    link VARCHAR(1000),
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_relevant_facts_asset_date ON relevant_facts(asset_id, event_date DESC);
