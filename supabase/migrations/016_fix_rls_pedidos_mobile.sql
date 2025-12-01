-- ============================================================================
-- MIGRATION 016: CORREÇÃO DEFINITIVA RLS PEDIDOS MOBILE - QR CODE
-- ============================================================================
-- 
-- Esta migration corrige definitivamente as RLS policies para permitir:
-- 1. Criação de pedidos de mesa por usuários anônimos (via QR code)
-- 2. Leitura de pedidos de mesa por usuários anônimos (após criar)
-- 3. Criação de itens de pedido de mesa por usuários anônimos
-- 4. Leitura de itens de pedido de mesa por usuários anônimos
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Esta migration remove TODAS as policies antigas e cria novas
-- - Todas as policies possuem fallbacks (IF NOT EXISTS, DROP IF EXISTS)
-- 
-- ============================================================================

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS POLICIES EXISTENTES (INSERT E SELECT)
-- ============================================================================

-- Remover todas as policies de INSERT para pedidos
DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir pedidos por mesa" ON pedidos;
DROP POLICY IF EXISTS "Permitir criação de pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon pode criar pedidos de mesa" ON pedidos;
DROP POLICY IF EXISTS "Authenticated pode criar pedidos" ON pedidos;

-- Remover todas as policies de SELECT para pedidos (se existirem)
DROP POLICY IF EXISTS "Usuários veem próprios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Anon pode ler pedidos de mesa" ON pedidos;
DROP POLICY IF EXISTS "Authenticated pode ler pedidos" ON pedidos;

-- Remover todas as policies de INSERT para itens_pedido
DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;
DROP POLICY IF EXISTS "Permitir criação de itens de pedido" ON itens_pedido;
DROP POLICY IF EXISTS "Anon pode criar itens de pedido de mesa" ON itens_pedido;
DROP POLICY IF EXISTS "Authenticated pode criar itens de pedido" ON itens_pedido;

-- Remover todas as policies de SELECT para itens_pedido (se existirem)
DROP POLICY IF EXISTS "Usuários veem itens de próprios pedidos" ON itens_pedido;
DROP POLICY IF EXISTS "Anon pode ler itens de pedido de mesa" ON itens_pedido;
DROP POLICY IF EXISTS "Authenticated pode ler itens de pedido" ON itens_pedido;

-- ============================================================================
-- PASSO 2: GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASSO 3: CRIAR POLICIES DE INSERT PARA PEDIDOS
-- ============================================================================

-- Policy para usuários anônimos criarem pedidos de mesa
CREATE POLICY "Anon pode criar pedidos de mesa" ON pedidos
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Apenas verificar se tem id_mesa (permite NULL em id_usuario)
    id_mesa IS NOT NULL
  );

-- Policy para usuários autenticados criarem pedidos
CREATE POLICY "Authenticated pode criar pedidos" ON pedidos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Pedido de mesa (pode ter id_usuario ou não)
    id_mesa IS NOT NULL
    OR
    -- Pedido normal (deve ser do próprio usuário)
    (id_usuario IS NOT NULL AND id_usuario = auth.uid())
  );

-- ============================================================================
-- PASSO 4: CRIAR POLICIES DE SELECT PARA PEDIDOS
-- ============================================================================

-- Policy para usuários anônimos lerem pedidos de mesa
-- IMPORTANTE: Permite ler qualquer pedido de mesa (necessário após criar)
CREATE POLICY "Anon pode ler pedidos de mesa" ON pedidos
  FOR SELECT
  TO anon
  USING (
    -- Permite ler pedidos de mesa (qualquer pedido com id_mesa)
    id_mesa IS NOT NULL
  );

-- Policy para usuários autenticados lerem pedidos
CREATE POLICY "Authenticated pode ler pedidos" ON pedidos
  FOR SELECT
  TO authenticated
  USING (
    -- Pode ler próprios pedidos
    (id_usuario IS NOT NULL AND id_usuario = auth.uid())
    OR
    -- Pode ler pedidos de mesa (para admin/dono gerenciarem)
    id_mesa IS NOT NULL
  );

-- ============================================================================
-- PASSO 5: CRIAR POLICIES DE INSERT PARA ITENS_PEDIDO
-- ============================================================================

-- Policy para usuários anônimos criarem itens de pedido de mesa
CREATE POLICY "Anon pode criar itens de pedido de mesa" ON itens_pedido
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND pedidos.id_mesa IS NOT NULL
    )
  );

-- Policy para usuários autenticados criarem itens de pedido
CREATE POLICY "Authenticated pode criar itens de pedido" ON itens_pedido
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND (
        -- Pedido de mesa
        pedidos.id_mesa IS NOT NULL
        OR
        -- Pedido do próprio usuário
        (pedidos.id_usuario IS NOT NULL AND pedidos.id_usuario = auth.uid())
      )
    )
  );

-- ============================================================================
-- PASSO 6: CRIAR POLICIES DE SELECT PARA ITENS_PEDIDO
-- ============================================================================

-- Policy para usuários anônimos lerem itens de pedido de mesa
CREATE POLICY "Anon pode ler itens de pedido de mesa" ON itens_pedido
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND pedidos.id_mesa IS NOT NULL
    )
  );

-- Policy para usuários autenticados lerem itens de pedido
CREATE POLICY "Authenticated pode ler itens de pedido" ON itens_pedido
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND (
        -- Pedido de mesa
        pedidos.id_mesa IS NOT NULL
        OR
        -- Pedido do próprio usuário
        (pedidos.id_usuario IS NOT NULL AND pedidos.id_usuario = auth.uid())
      )
    )
  );

-- ============================================================================
-- PASSO 7: VERIFICAR POLICIES CRIADAS
-- ============================================================================

SELECT 
  'POLICIES DE PEDIDOS:' as info,
  tablename,
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos'
ORDER BY cmd, policyname;

SELECT 
  'POLICIES DE ITENS_PEDIDO:' as info,
  tablename,
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'itens_pedido'
ORDER BY cmd, policyname;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

