-- ============================================================================
-- MIGRATION 006: CRIAR RLS POLICIES PARA MESAS E CONTAS
-- ============================================================================
-- 
-- Este arquivo cria as políticas RLS (Row Level Security) para as tabelas
-- de mesas e contas_mesa
-- Execute no Supabase SQL Editor
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se as policies foram criadas corretamente
-- 
-- ============================================================================

-- ============================================================================
-- HABILITAR RLS NAS TABELAS
-- ============================================================================

ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_mesa ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES PARA TABELA MESAS
-- ============================================================================

-- Qualquer um pode ler mesas (para acesso via QR code)
DROP POLICY IF EXISTS "Mesas são públicas para leitura" ON mesas;
CREATE POLICY "Mesas são públicas para leitura" ON mesas
  FOR SELECT
  USING (true);

-- Apenas autenticados podem inserir mesas (admin/dono)
DROP POLICY IF EXISTS "Autenticados podem criar mesas" ON mesas;
CREATE POLICY "Autenticados podem criar mesas" ON mesas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Apenas autenticados podem atualizar mesas (admin/dono)
DROP POLICY IF EXISTS "Autenticados podem atualizar mesas" ON mesas;
CREATE POLICY "Autenticados podem atualizar mesas" ON mesas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Apenas autenticados podem deletar mesas (admin/dono)
DROP POLICY IF EXISTS "Autenticados podem deletar mesas" ON mesas;
CREATE POLICY "Autenticados podem deletar mesas" ON mesas
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- POLICIES PARA TABELA CONTAS_MESA
-- ============================================================================

-- Apenas autenticados podem ler contas (admin/dono)
DROP POLICY IF EXISTS "Autenticados podem ler contas" ON contas_mesa;
CREATE POLICY "Autenticados podem ler contas" ON contas_mesa
  FOR SELECT
  TO authenticated
  USING (true);

-- Apenas autenticados podem criar contas (admin/dono)
DROP POLICY IF EXISTS "Autenticados podem criar contas" ON contas_mesa;
CREATE POLICY "Autenticados podem criar contas" ON contas_mesa
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Apenas autenticados podem atualizar contas (admin/dono)
DROP POLICY IF EXISTS "Autenticados podem atualizar contas" ON contas_mesa;
CREATE POLICY "Autenticados podem atualizar contas" ON contas_mesa
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Apenas autenticados podem deletar contas (admin/dono)
DROP POLICY IF EXISTS "Autenticados podem deletar contas" ON contas_mesa;
CREATE POLICY "Autenticados podem deletar contas" ON contas_mesa
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- ATUALIZAR POLICIES DE PEDIDOS PARA PERMITIR PEDIDOS POR MESA
-- ============================================================================

-- Permitir que qualquer um crie pedido vinculado a mesa (via QR code)
-- Mas apenas autenticados podem criar pedidos normais
DROP POLICY IF EXISTS "Permitir pedidos por mesa" ON pedidos;
CREATE POLICY "Permitir pedidos por mesa" ON pedidos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Se tem id_mesa, permite (pedido via QR code)
    id_mesa IS NOT NULL
    OR
    -- Se tem id_usuario, apenas autenticados
    (id_usuario IS NOT NULL AND auth.role() = 'authenticated')
  );

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

