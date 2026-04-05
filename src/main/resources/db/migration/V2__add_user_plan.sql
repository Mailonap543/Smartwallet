-- V2: Add plan field to users table for SaaS

ALTER TABLE users ADD COLUMN plan VARCHAR(20) NOT NULL DEFAULT 'FREE';
ALTER TABLE users ADD COLUMN plan_upgrade_date TIMESTAMP;

-- Add indexes for plan queries
CREATE INDEX idx_users_plan ON users(plan);

-- Update subscriptions to use plan enum instead of plan_name
ALTER TABLE subscriptions RENAME COLUMN plan_name TO plan_type;