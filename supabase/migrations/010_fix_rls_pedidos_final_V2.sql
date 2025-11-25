-- ============================================================================
-- MIGRATION 010 V2: CORRIGIR DEFINITIVAMENTE RLS POLICIES PARA PEDIDOS
-- ============================================================================
-- 
-- VERSÃO SIMPLIFICADA - Execute esta se a versão anterior deu erro
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Esta versão garante remoção completa antes de criar
-- 
-- ============================================================================

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS POLICIES DE INSERT EXISTENTES
-- ============================================================================

-- Remover todas as policies de INSERT na tabela pedidos
DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir pedidos por mesa" ON pedidos;
DROP POLICY IF EXISTS "Permitir criação de pedidos" ON pedidos;

-- Remover todas as policies de INSERT na tabela itens_pedido
DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;
DROP POLICY IF EXISTS "Permitir criação de itens de pedido" ON itens_pedido;

-- ============================================================================
-- PASSO 2: CRIAR POLICY ÚNICA PARA PEDIDOS
-- ============================================================================

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
-- PASSO 3: CRIAR POLICY ÚNICA PARA ITENS_PEDIDO
-- ============================================================================

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
-- PASSO 4: GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

