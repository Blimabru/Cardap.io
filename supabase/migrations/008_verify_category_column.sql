-- ============================================================================
-- MIGRATION 008: VERIFICAR E CORRIGIR COLUNA categoryId
-- ============================================================================
-- 
-- Esta migration verifica o nome real da coluna de categoria na tabela products
-- e garante que está correta para o Supabase
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique o resultado antes de executar qualquer ALTER TABLE
-- 
-- ============================================================================

-- 1. Verificar nome atual da coluna
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND (column_name LIKE '%categor%' OR column_name LIKE '%category%')
ORDER BY column_name;

-- 2. Se a coluna se chama 'categoryid' (tudo minúsculo), renomear para 'categoryId' (camelCase)
-- Descomente a linha abaixo se necessário:
-- ALTER TABLE products RENAME COLUMN categoryid TO "categoryId";

-- 3. Se a coluna se chama 'category_id' (snake_case), renomear para 'categoryId' (camelCase)
-- Descomente a linha abaixo se necessário:
-- ALTER TABLE products RENAME COLUMN category_id TO "categoryId";

-- 4. Garantir que o índice está correto
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX IF NOT EXISTS idx_products_category ON products("categoryId");

-- 5. Verificar estrutura final
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name = 'categoryId';

-- ============================================================================
-- NOTA: Se nenhuma coluna for encontrada, você precisa criar a coluna:
-- ============================================================================
-- ALTER TABLE products ADD COLUMN "categoryId" UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT;
-- ============================================================================

