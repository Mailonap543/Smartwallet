-- Add missing columns to audit_logs
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS old_value JSONB,
    ADD COLUMN IF NOT EXISTS new_value JSONB,
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
    ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add missing columns to watchlists (for Kotlin version compatibility)
ALTER TABLE watchlists
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Add missing columns to alerts (for nullable created_at)
-- Already exists, just ensure it's nullable

-- Add missing columns to news_items
ALTER TABLE news_items
    ADD COLUMN IF NOT EXISTS url VARCHAR(500);

-- Add missing column to notifications (updated_at for consistency)
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_name ON watchlists(name);
CREATE INDEX IF NOT EXISTS idx_alerts_asset_symbol ON alerts(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id_active ON alerts(user_id, is_active);
