CREATE TABLE IF NOT EXISTS subscription_plan_settings (
    id BIGSERIAL PRIMARY KEY,
    plan_name VARCHAR(30) NOT NULL UNIQUE,
    display_name VARCHAR(80) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 20,
    highlighted BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    accent_color VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plan_settings
    (plan_name, display_name, description, monthly_price, annual_discount_percent, highlighted, display_order, accent_color)
VALUES
    ('FREE', 'Básico', 'Ferramentas essenciais para organizar seus investimentos e acompanhar o mercado.', 29.90, 17, false, 1, '#009DFF'),
    ('PREMIUM', 'Premium', 'Recursos avançados com IA para análises mais profundas e melhores decisões.', 59.90, 20, true, 2, '#7C3AED'),
    ('ENTERPRISE', 'Ultimate', 'Experiência completa com máxima tecnologia, segurança e suporte exclusivo.', 99.90, 20, false, 3, '#00D6B4')
ON CONFLICT (plan_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS bank_payment_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id VARCHAR(100) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'PIX',
    status VARCHAR(30) NOT NULL,
    reference_type VARCHAR(60),
    reference_id VARCHAR(120),
    pix_key VARCHAR(160),
    beneficiary_name VARCHAR(255),
    description TEXT,
    external_id VARCHAR(120) UNIQUE,
    checkout_url TEXT,
    pix_copy_paste TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_payment_orders_user_id ON bank_payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_payment_orders_status ON bank_payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_bank_payment_orders_reference ON bank_payment_orders(reference_type, reference_id);
