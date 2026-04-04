-- V3: Add Stripe payment fields

ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255);

-- Add indexes for Stripe queries
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_subscription ON users(stripe_subscription_id);

-- Update subscriptions table with payment info
ALTER TABLE subscriptions ADD COLUMN stripe_session_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN stripe_invoice_id VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';