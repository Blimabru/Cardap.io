-- ============================================================================
-- MIGRATION 011: VERIFICAR E GARANTIR POLICIES CORRETAS PARA PEDIDOS
-- ============================================================================
-- 
-- Este arquivo verifica se as policies estão corretas e garante que
-- pedidos de mesa possam ser criados sem autenticação
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Execute APÓS a migration 010
-- 
-- ============================================================================

-- ============================================================================
-- VERIFICAR POLICIES EXISTENTES
-- ============================================================================

-- Listar todas as policies de INSERT na tabela pedidos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos' AND cmd = 'INSERT'
ORDER BY policyname;

-- ============================================================================
-- GARANTIR QUE APENAS UMA POLICY DE INSERT EXISTE
-- ============================================================================

-- Remover TODAS as policies de INSERT para garantir limpeza
DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir pedidos por mesa" ON pedidos;
DROP POLICY IF EXISTS "Permitir criação de pedidos" ON pedidos;

-- ============================================================================
-- CRIAR POLICY ÚNICA E DEFINITIVA
-- ============================================================================

-- Policy única que permite:
-- 1. Pedidos de usuários autenticados (id_usuario = auth.uid())
-- 2. Pedidos de mesa via QR code (id_mesa IS NOT NULL, pode ser anônimo)
CREATE POLICY "Permitir criação de pedidos" ON pedidos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Caso 1: Pedido de usuário autenticado (deve ser o próprio usuário)
    (id_usuario IS NOT NULL AND auth.role() = 'authenticated' AND id_usuario = auth.uid())
    OR
    -- Caso 2: Pedido de mesa (anon ou authenticated, id_mesa obrigatório)
    -- Permite pedidos anônimos se tiver id_mesa
    (id_mesa IS NOT NULL)
  );

-- ============================================================================
-- GARANTIR POLICY DE ITENS_PEDIDO
-- ============================================================================

DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;
DROP POLICY IF EXISTS "Permitir criação de itens de pedido" ON itens_pedido;

-- Policy que permite criar itens se o pedido foi criado pelo usuário ou é de mesa
CREATE POLICY "Permitir criação de itens de pedido" ON itens_pedido
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND (
        -- Pedido do usuário autenticado
        (pedidos.id_usuario IS NOT NULL AND auth.role() = 'authenticated' AND pedidos.id_usuario = auth.uid())
        OR
        -- Pedido de mesa (pode ser anônimo)
        pedidos.id_mesa IS NOT NULL
      )
    )
  );

-- ============================================================================
-- VERIFICAR RESULTADO FINAL
-- ============================================================================

-- Listar policies finais
SELECT 
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename IN ('pedidos', 'itens_pedido') AND cmd = 'INSERT'
ORDER BY tablename, policyname;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

