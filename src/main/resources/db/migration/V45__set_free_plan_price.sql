UPDATE subscription_plan_settings
SET
    display_name = 'Free',
    description = 'Plano gratuito para testar a carteira, organizar ativos e acompanhar o mercado.',
    monthly_price = 0.00,
    annual_discount_percent = 0,
    highlighted = false,
    display_order = 1,
    accent_color = '#009DFF',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP
WHERE plan_name = 'FREE';

UPDATE subscription_plan_settings
SET
    monthly_price = 59.90,
    annual_discount_percent = 20,
    highlighted = true,
    display_order = 2,
    accent_color = '#7C3AED',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP
WHERE plan_name = 'PREMIUM';

UPDATE subscription_plan_settings
SET
    display_name = 'Ultimate',
    monthly_price = 99.90,
    annual_discount_percent = 20,
    highlighted = false,
    display_order = 3,
    accent_color = '#00D6B4',
    is_active = true,
    updated_at = CURRENT_TIMESTAMP
WHERE plan_name = 'ENTERPRISE';
