-- ============================================================================
-- MIGRATION 018: CORRIGIR CONSTRAINT FORMA_PAGAMENTO EM RENDIMENTOS
-- ============================================================================
-- 
-- Este arquivo corrige a constraint check_forma_pagamento para aceitar
-- os valores corretos do enum FormaPagamento
-- Execute no Supabase SQL Editor
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se a constraint foi atualizada corretamente
-- 
-- ============================================================================

-- Remover constraint antiga
ALTER TABLE rendimentos 
DROP CONSTRAINT IF EXISTS check_forma_pagamento;

-- Criar constraint nova com valores corretos
ALTER TABLE rendimentos
ADD CONSTRAINT check_forma_pagamento 
CHECK (forma_pagamento IN ('dinheiro', 'cartao_debito', 'cartao_credito', 'pix'));

-- Atualizar comentário
COMMENT ON COLUMN rendimentos.forma_pagamento IS 'Forma de pagamento: dinheiro, cartao_debito, cartao_credito ou pix';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================


