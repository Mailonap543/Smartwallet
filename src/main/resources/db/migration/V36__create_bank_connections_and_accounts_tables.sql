-- Create bank_connections table (from BankDtos)
CREATE TABLE IF NOT EXISTS bank_connections (
                                                id BIGSERIAL PRIMARY KEY,
                                                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id VARCHAR(100) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    linked_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_institution_id ON bank_connections(institution_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_is_active ON bank_connections(is_active);

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
                                             id BIGSERIAL PRIMARY KEY,
                                             bank_connection_id BIGINT NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    account_id VARCHAR(100) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50),
    balance DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_bank_accounts_bank_connection_id ON bank_accounts(bank_connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_id ON bank_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON bank_accounts(is_active);

-- Create bank_transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 bank_account_id BIGINT NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE INDEX IF NOT EXISTS idx_bank_transactions_bank_account_id ON bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_transaction_date ON bank_transactions(transaction_date);
