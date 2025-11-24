-- ============================================================================
-- MIGRATION 008: CORRIGIR NOMES DAS COLUNAS EM CAMELCASE
-- ============================================================================
-- 
-- Esta migration garante que todas as colunas em camelCase estão com o nome correto
-- para funcionar com o Supabase
-- 
-- Colunas que precisam estar em camelCase:
-- - categoryId (não categoryid)
-- - imageUrl (não imageurl)
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- 
-- ============================================================================

-- 0. Verificar colunas atuais (para diagnóstico)
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY column_name;

-- 1. Renomear coluna categoryid (minúsculo) para categoryId (camelCase)
-- O PostgreSQL cria colunas sem aspas em minúsculo por padrão
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'categoryid'
  ) THEN
    ALTER TABLE products RENAME COLUMN categoryid TO "categoryId";
    RAISE NOTICE '✅ Coluna categoryid renomeada para categoryId';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna categoryId já está correta ou não existe';
  END IF;
END $$;

-- 2. Renomear coluna imageurl (minúsculo) para imageUrl (camelCase)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'imageurl'
  ) THEN
    ALTER TABLE products RENAME COLUMN imageurl TO "imageUrl";
    RAISE NOTICE '✅ Coluna imageurl renomeada para imageUrl';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna imageUrl já está correta ou não existe';
  END IF;
END $$;

-- 3. Recriar índices com os nomes corretos
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX IF NOT EXISTS idx_products_category ON products("categoryId");

-- 4. Verificar resultado final
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('categoryId', 'imageUrl', 'name', 'description', 'price', 'rating')
ORDER BY column_name;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

