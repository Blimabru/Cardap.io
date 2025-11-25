-- ============================================================================
-- MIGRATION 013: CORREÇÃO SIMPLES E DIRETA - RLS PEDIDOS MESA
-- ============================================================================
-- 
-- VERSÃO ULTRA SIMPLIFICADA
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
-- CRIAR POLICY ULTRA SIMPLES PARA PEDIDOS
-- ============================================================================

-- Policy simples: permite se tiver id_mesa (anon ou authenticated)
-- OU se for usuário autenticado criando seu próprio pedido
-- IMPORTANTE: Para pedidos de mesa, não verificamos auth.uid() porque pode ser anônimo
CREATE POLICY "Permitir criação de pedidos" ON pedidos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Caso 1: Pedido de mesa (permite anon - id_usuario pode ser NULL)
    (id_mesa IS NOT NULL)
    OR
    -- Caso 2: Pedido de usuário autenticado (deve ter id_usuario = auth.uid())
    (id_usuario IS NOT NULL AND auth.uid() IS NOT NULL AND id_usuario = auth.uid())
  );

-- ============================================================================
-- CRIAR POLICY ULTRA SIMPLES PARA ITENS_PEDIDO
-- ============================================================================

CREATE POLICY "Permitir criação de itens de pedido" ON itens_pedido
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND (
        pedidos.id_mesa IS NOT NULL
        OR
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
WHERE tablename IN ('pedidos', 'itens_pedido') AND cmd = 'INSERT';

