DO $$
BEGIN
    -- 1. Audit Logs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_logs_user_id') THEN
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
END IF;

    -- 2. Alerts
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_alerts_user_id') THEN
ALTER TABLE alerts ADD CONSTRAINT fk_alerts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END IF;

    -- 3. Watchlists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_watchlists_user_id') THEN
ALTER TABLE watchlists ADD CONSTRAINT fk_watchlists_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END IF;

    -- 4. Notifications
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user_id') THEN
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END IF;

    -- 5. Quote History
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_quote_history_asset_id') THEN
ALTER TABLE quote_history ADD CONSTRAINT fk_quote_history_asset_id FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;
END IF;
END $$;