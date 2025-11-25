-- ============================================================================
-- MIGRATION 014: CORREÇÃO DEFINITIVA - RLS PEDIDOS MESA
-- ============================================================================
-- 
-- Esta versão separa explicitamente os casos de anon e authenticated
-- Execute este SQL no Supabase SQL Editor
-- 
-- ============================================================================

-- ============================================================================
-- REMOVER TODAS AS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir pedidos por mesa" ON pedidos;
DROP POLICY IF EXISTS "Permitir criação de pedidos" ON pedidos;
DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;
DROP POLICY IF EXISTS "Permitir criação de itens de pedido" ON itens_pedido;

-- ============================================================================
-- CRIAR POLICY PARA PEDIDOS DE MESA (ANON)
-- ============================================================================

-- Policy específica para usuários anônimos criando pedidos de mesa
-- IMPORTANTE: Removida verificação de id_usuario IS NULL para ser mais permissiva
CREATE POLICY "Anon pode criar pedidos de mesa" ON pedidos
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Apenas verificar se tem id_mesa (mais permissivo)
    id_mesa IS NOT NULL
  );

-- ============================================================================
-- CRIAR POLICY PARA PEDIDOS DE USUÁRIOS AUTENTICADOS
-- ============================================================================

-- Policy para usuários autenticados (podem criar pedidos normais ou de mesa)
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
-- CRIAR POLICY PARA ITENS_PEDIDO (ANON)
-- ============================================================================

CREATE POLICY "Anon pode criar itens de pedido de mesa" ON itens_pedido
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND pedidos.id_mesa IS NOT NULL
      -- Removida verificação de id_usuario IS NULL para ser mais permissiva
    )
  );

-- ============================================================================
-- CRIAR POLICY PARA ITENS_PEDIDO (AUTHENTICATED)
-- ============================================================================

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
-- VERIFICAR
-- ============================================================================

SELECT 
  tablename,
  policyname,
  roles,
  with_check
FROM pg_policies 
WHERE tablename IN ('pedidos', 'itens_pedido') AND cmd = 'INSERT'
ORDER BY tablename, policyname;

