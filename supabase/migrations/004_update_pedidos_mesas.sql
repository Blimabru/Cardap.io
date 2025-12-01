-- ============================================================================
-- MIGRATION 004: ATUALIZAR TABELA PEDIDOS PARA SUPORTE A MESAS
-- ============================================================================
-- 
-- Este arquivo adiciona campos necessários na tabela pedidos para suportar
-- pedidos por mesa (via QR code)
-- Execute no Supabase SQL Editor
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se os campos foram adicionados corretamente
-- - Após criar, execute 005_create_contas_mesa.sql
-- 
-- ============================================================================

-- ============================================================================
-- ADICIONAR COLUNAS NA TABELA PEDIDOS
-- ============================================================================

-- Adicionar id_mesa (FK para mesas, NULLABLE)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pedidos' AND column_name='id_mesa'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN id_mesa UUID REFERENCES mesas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Adicionar status_pagamento
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pedidos' AND column_name='status_pagamento'
  ) THEN
    ALTER TABLE pedidos ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'pendente' NOT NULL;
  END IF;
END $$;

-- Tornar id_usuario NULLABLE (para pedidos anônimos via QR)
DO $$ 
BEGIN
  -- Verificar se a coluna existe e se é NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pedidos' 
    AND column_name='id_usuario' 
    AND is_nullable = 'NO'
  ) THEN
    -- Remover constraint NOT NULL temporariamente
    ALTER TABLE pedidos ALTER COLUMN id_usuario DROP NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- ATUALIZAR CONSTRAINT CHECK DE STATUS
-- ============================================================================

-- Remover constraint antiga se existir
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS check_status;

-- Adicionar nova constraint com status atualizado
ALTER TABLE pedidos ADD CONSTRAINT check_status 
  CHECK (status IN ('pendente', 'confirmado', 'em_preparo', 'pronto', 'saiu_entrega', 'entregue', 'cancelado'));

-- ============================================================================
-- ADICIONAR CONSTRAINT CHECK PARA STATUS_PAGAMENTO
-- ============================================================================

ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS check_status_pagamento;
ALTER TABLE pedidos ADD CONSTRAINT check_status_pagamento 
  CHECK (status_pagamento IN ('pendente', 'pago', 'cancelado'));

-- ============================================================================
-- ADICIONAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pedidos_mesa ON pedidos(id_mesa);
CREATE INDEX IF NOT EXISTS idx_pedidos_status_pagamento ON pedidos(status_pagamento);

-- ============================================================================
-- ADICIONAR CONSTRAINT: Pedido deve ter id_usuario OU id_mesa
-- ============================================================================

-- Criar função para validar que pedido tem usuário ou mesa
CREATE OR REPLACE FUNCTION validate_pedido_usuario_mesa()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_usuario IS NULL AND NEW.id_mesa IS NULL THEN
    RAISE EXCEPTION 'Pedido deve ter id_usuario ou id_mesa';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar
DROP TRIGGER IF EXISTS validate_pedido_usuario_mesa_trigger ON pedidos;
CREATE TRIGGER validate_pedido_usuario_mesa_trigger
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION validate_pedido_usuario_mesa();

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

