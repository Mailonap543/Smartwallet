-- Altera o tipo da coluna day_volume para se adequar ao mapeamento Java (Long/BigInteger)
ALTER TABLE assets ALTER COLUMN day_volume TYPE BIGINT;