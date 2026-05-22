ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_invested NUMERIC(15, 2) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_profit_loss NUMERIC(15, 2) DEFAULT 0;

UPDATE wallets SET total_balance = 0 WHERE total_balance IS NULL;
UPDATE wallets SET total_invested = 0 WHERE total_invested IS NULL;
UPDATE wallets SET total_profit_loss = 0 WHERE total_profit_loss IS NULL;

ALTER TABLE wallets ALTER COLUMN total_balance SET DEFAULT 0;
ALTER TABLE wallets ALTER COLUMN total_invested SET DEFAULT 0;
ALTER TABLE wallets ALTER COLUMN total_profit_loss SET DEFAULT 0;
