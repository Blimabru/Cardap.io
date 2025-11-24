-- ============================================================================
-- MIGRATION 005: CRIAR TABELA CONTAS_MESA
-- ============================================================================
-- 
-- Este arquivo cria a tabela de contas de mesa para agrupar pedidos
-- Execute no Supabase SQL Editor
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se a tabela foi criada corretamente
-- 
-- ============================================================================

-- ============================================================================
-- TABELA: contas_mesa
-- ============================================================================
-- Armazena contas agrupadas de pedidos por mesa

CREATE TABLE IF NOT EXISTS contas_mesa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_mesa UUID NOT NULL REFERENCES mesas(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'aberta' NOT NULL,
  total DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  data_abertura TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_fechamento TIMESTAMPTZ,
  data_pagamento TIMESTAMPTZ,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT check_status_conta CHECK (status IN ('aberta', 'fechada', 'paga', 'cancelada'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contas_mesa_mesa ON contas_mesa(id_mesa);
CREATE INDEX IF NOT EXISTS idx_contas_mesa_status ON contas_mesa(status);
CREATE INDEX IF NOT EXISTS idx_contas_mesa_data_abertura ON contas_mesa(data_abertura DESC);
CREATE INDEX IF NOT EXISTS idx_contas_mesa_data_fechamento ON contas_mesa(data_fechamento DESC);

-- ============================================================================
-- TRIGGER: Atualizar data_atualizacao automaticamente
-- ============================================================================

DROP TRIGGER IF EXISTS update_contas_mesa_updated_at ON contas_mesa;
CREATE TRIGGER update_contas_mesa_updated_at
  BEFORE UPDATE ON contas_mesa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÃO: Fechar conta da mesa (agrupa pedidos e calcula total)
-- ============================================================================

CREATE OR REPLACE FUNCTION fechar_conta_mesa(p_mesa_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conta_id UUID;
  v_total DECIMAL(10, 2);
BEGIN
  -- Calcular total dos pedidos não pagos da mesa
  SELECT COALESCE(SUM(total), 0.00)
  INTO v_total
  FROM pedidos
  WHERE id_mesa = p_mesa_id
    AND status_pagamento = 'pendente'
    AND status != 'cancelado';
  
  -- Criar conta
  INSERT INTO contas_mesa (id_mesa, status, total, data_fechamento)
  VALUES (p_mesa_id, 'fechada', v_total, NOW())
  RETURNING id INTO v_conta_id;
  
  RETURN v_conta_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNÇÃO: Finalizar pagamento da conta
-- ============================================================================

CREATE OR REPLACE FUNCTION finalizar_pagamento_conta(
  p_conta_id UUID,
  p_forma_pagamento VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_mesa_id UUID;
BEGIN
  -- Buscar id_mesa da conta
  SELECT id_mesa INTO v_mesa_id
  FROM contas_mesa
  WHERE id = p_conta_id;
  
  IF v_mesa_id IS NULL THEN
    RAISE EXCEPTION 'Conta não encontrada';
  END IF;
  
  -- Atualizar conta
  UPDATE contas_mesa
  SET 
    status = 'paga',
    forma_pagamento = p_forma_pagamento,
    data_pagamento = NOW()
  WHERE id = p_conta_id;
  
  -- Marcar pedidos como pagos
  UPDATE pedidos
  SET status_pagamento = 'pago'
  WHERE id_mesa = v_mesa_id
    AND status_pagamento = 'pendente'
    AND status != 'cancelado';
  
  -- Atualizar status da mesa para livre
  UPDATE mesas
  SET status = 'livre'
  WHERE id = v_mesa_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

