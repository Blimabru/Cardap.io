-- ============================================================================
-- MIGRATION 017: CRIAR TABELA RENDIMENTOS
-- ============================================================================
-- 
-- Este arquivo cria a tabela de rendimentos para contabilizar pagamentos
-- Execute no Supabase SQL Editor
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se a tabela foi criada corretamente
-- 
-- ============================================================================

-- ============================================================================
-- TABELA: rendimentos
-- ============================================================================
-- Armazena rendimentos do restaurante por pagamento de contas

CREATE TABLE IF NOT EXISTS rendimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_conta_mesa UUID NOT NULL REFERENCES contas_mesa(id) ON DELETE RESTRICT,
  valor DECIMAL(10, 2) NOT NULL,
  forma_pagamento VARCHAR(50) NOT NULL,
  observacoes TEXT,
  data_pagamento TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT check_valor_positivo CHECK (valor > 0),
  CONSTRAINT check_forma_pagamento CHECK (forma_pagamento IN ('dinheiro', 'cartao_debito', 'cartao_credito', 'pix'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rendimentos_conta ON rendimentos(id_conta_mesa);
CREATE INDEX IF NOT EXISTS idx_rendimentos_data_pagamento ON rendimentos(data_pagamento DESC);
CREATE INDEX IF NOT EXISTS idx_rendimentos_forma_pagamento ON rendimentos(forma_pagamento);

-- ============================================================================
-- TRIGGER: Atualizar data_atualizacao automaticamente
-- ============================================================================

DROP TRIGGER IF EXISTS update_rendimentos_updated_at ON rendimentos;
CREATE TRIGGER update_rendimentos_updated_at
  BEFORE UPDATE ON rendimentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE rendimentos ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas usuários autenticados podem ler rendimentos
CREATE POLICY "Authenticated pode ler rendimentos"
  ON rendimentos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Apenas usuários autenticados podem inserir rendimentos
CREATE POLICY "Authenticated pode inserir rendimentos"
  ON rendimentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Apenas usuários autenticados podem atualizar rendimentos
CREATE POLICY "Authenticated pode atualizar rendimentos"
  ON rendimentos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNÇÃO RPC: Registrar rendimento ao pagar conta
-- ============================================================================

CREATE OR REPLACE FUNCTION registrar_rendimento(
  p_conta_id UUID,
  p_valor DECIMAL,
  p_forma_pagamento VARCHAR
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rendimento_id UUID;
BEGIN
  -- Inserir rendimento
  INSERT INTO rendimentos (
    id_conta_mesa,
    valor,
    forma_pagamento,
    data_pagamento
  ) VALUES (
    p_conta_id,
    p_valor,
    p_forma_pagamento,
    NOW()
  )
  RETURNING id INTO v_rendimento_id;

  RETURN v_rendimento_id;
END;
$$;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE rendimentos IS 'Armazena rendimentos do restaurante por pagamento de contas';
COMMENT ON COLUMN rendimentos.id_conta_mesa IS 'Referência à conta da mesa que gerou o rendimento';
COMMENT ON COLUMN rendimentos.valor IS 'Valor do rendimento (deve ser positivo)';
COMMENT ON COLUMN rendimentos.forma_pagamento IS 'Forma de pagamento: dinheiro, cartao_debito, cartao_credito ou pix';
COMMENT ON COLUMN rendimentos.data_pagamento IS 'Data e hora do pagamento';

