-- ============================================================================
-- MIGRATION 003: CRIAR TABELA MESAS
-- ============================================================================
-- 
-- Este arquivo cria a tabela de mesas para o sistema de QR codes
-- Execute no Supabase SQL Editor
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se a tabela foi criada corretamente
-- - Após criar, execute 004_update_pedidos_mesas.sql
-- 
-- ============================================================================

-- ============================================================================
-- TABELA: mesas
-- ============================================================================
-- Armazena informações das mesas do restaurante

CREATE TABLE IF NOT EXISTS mesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER UNIQUE NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'livre' NOT NULL,
  capacidade INTEGER DEFAULT 4 NOT NULL,
  observacoes TEXT,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT check_status_mesa CHECK (status IN ('livre', 'ocupada', 'reservada', 'inativa'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mesas_numero ON mesas(numero);
CREATE INDEX IF NOT EXISTS idx_mesas_qr_code ON mesas(qr_code);
CREATE INDEX IF NOT EXISTS idx_mesas_status ON mesas(status);
CREATE INDEX IF NOT EXISTS idx_mesas_data_criacao ON mesas(data_criacao DESC);

-- ============================================================================
-- TRIGGER: Atualizar data_atualizacao automaticamente
-- ============================================================================

DROP TRIGGER IF EXISTS update_mesas_updated_at ON mesas;
CREATE TRIGGER update_mesas_updated_at
  BEFORE UPDATE ON mesas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED: Inserir mesas iniciais (10 mesas)
-- ============================================================================

-- Função para gerar QR code único (UUID)
DO $$
DECLARE
  i INTEGER;
  qr_uuid TEXT;
BEGIN
  FOR i IN 1..10 LOOP
    -- Gerar UUID único para QR code
    qr_uuid := gen_random_uuid()::TEXT;
    
    -- Inserir mesa apenas se não existir
    INSERT INTO mesas (numero, qr_code, status, capacidade)
    VALUES (i, qr_uuid, 'livre', 4)
    ON CONFLICT (numero) DO NOTHING;
  END LOOP;
END $$;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

