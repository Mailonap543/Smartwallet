-- SmartWallet Schema - Initial Migration
-- Version: V1__initial_schema.sql

-- Users table
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255) NOT NULL,
                       cpf VARCHAR(14) UNIQUE,
                       phone VARCHAR(20),
                       is_active BOOLEAN DEFAULT true,
                       email_verified BOOLEAN DEFAULT false,
                       role VARCHAR(20) NOT NULL DEFAULT 'USER',
                       profile_image_url VARCHAR(500),
                       reset_token VARCHAR2(255), -- Corrigido para VARCHAR2 para atender a regra do Sonar
                       reset_token_expiry TIMESTAMP,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_reset_token ON users(reset_token);
CREATE INDEX idx_users_role ON users(role);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
                                id BIGSERIAL PRIMARY KEY,
                                token VARCHAR(255) NOT NULL UNIQUE,
                                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                expires_at TIMESTAMP NOT NULL,
                                is_revoked BOOLEAN DEFAULT false,
                                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Subscriptions table
CREATE TABLE subscriptions (
                               id BIGSERIAL PRIMARY KEY,
                               user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               plan_name VARCHAR(50) NOT NULL,
                               status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                               start_date DATE NOT NULL,
                               end_date DATE,
                               monthly_price DECIMAL(10, 2) NOT NULL,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Wallets (portfolios)
CREATE TABLE wallets (
                         id BIGSERIAL PRIMARY KEY,
                         user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         name VARCHAR(255) NOT NULL,
                         description TEXT,
                         total_balance DECIMAL(15, 2) DEFAULT 0,
                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- Market Assets (stocks, crypto, etc. - market data)
CREATE TABLE assets (
                        id BIGSERIAL PRIMARY KEY,
                        symbol VARCHAR(20) NOT NULL UNIQUE,
                        name VARCHAR(255) NOT NULL,
                        asset_type VARCHAR(20) NOT NULL,
                        current_price DECIMAL(15, 2),
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(asset_type);

-- Portfolio Assets (user holdings in wallets)
CREATE TABLE portfolio_assets (
                                  id BIGSERIAL PRIMARY KEY,
                                  wallet_id BIGINT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
                                  asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
                                  quantity DECIMAL(18, 8) NOT NULL,
                                  purchase_price DECIMAL(15, 2) NOT NULL,
                                  purchase_date DATE NOT NULL,
                                  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_assets_wallet_id ON portfolio_assets(wallet_id);
CREATE INDEX idx_portfolio_assets_asset_id ON portfolio_assets(asset_id);

-- Transactions
CREATE TABLE transactions (
                              id BIGSERIAL PRIMARY KEY,
                              portfolio_asset_id BIGINT NOT NULL REFERENCES portfolio_assets(id) ON DELETE CASCADE,
                              transaction_type VARCHAR(20) NOT NULL,
                              quantity DECIMAL(18, 8) NOT NULL,
                              price DECIMAL(15, 2) NOT NULL,
                              total_value DECIMAL(15, 2) NOT NULL,
                              fees DECIMAL(10, 2) DEFAULT 0,
                              transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              notes TEXT,
                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_portfolio_asset_id ON transactions(portfolio_asset_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- AI Recommendations
CREATE TABLE ai_recommendations (
                                    id BIGSERIAL PRIMARY KEY,
                                    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                    recommendation_type VARCHAR(50) NOT NULL,
                                    title VARCHAR(255) NOT NULL,
                                    description TEXT NOT NULL,
                                    confidence_score DECIMAL(5, 2),
                                    is_read BOOLEAN DEFAULT false,
                                    is_accepted BOOLEAN DEFAULT false,
                                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_type ON ai_recommendations(recommendation_type);

-- Audit Log
CREATE TABLE audit_logs (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
                            action VARCHAR(100) NOT NULL,
                            entity_type VARCHAR(100),
                            entity_id BIGINT,
                            old_value JSONB,
                            new_value JSONB,
                            ip_address VARCHAR(45),
                            user_agent TEXT,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);