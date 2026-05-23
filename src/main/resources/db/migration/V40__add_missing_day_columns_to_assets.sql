-- 1. Cria as colunas de variação diária exigidas na validação do Hibernate
ALTER TABLE assets ADD COLUMN IF NOT EXISTS day_high NUMERIC(19, 4);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS day_low NUMERIC(19, 4);

-- 2. Cria a Chave Estrangeira definitiva com a tabela de categorias
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_assets_category_id'
        AND table_name = 'assets'
    ) THEN
ALTER TABLE assets ADD CONSTRAINT fk_assets_category_id
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL;
END IF;
END $$;