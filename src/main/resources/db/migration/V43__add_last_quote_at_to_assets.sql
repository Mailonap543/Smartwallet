-- Adiciona a coluna de data/hora da última cotação exigida pelo Hibernate
ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_quote_at TIMESTAMP WITH TIME ZONE;