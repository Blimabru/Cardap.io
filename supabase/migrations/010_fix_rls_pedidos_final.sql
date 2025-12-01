-- ============================================================================
-- MIGRATION 010: CORRIGIR DEFINITIVAMENTE RLS POLICIES PARA PEDIDOS
-- ============================================================================
-- 
-- Este arquivo remove todas as policies conflitantes e cria uma única policy
-- clara que permite pedidos de mesa (anon) e pedidos de usuários autenticados
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Execute APÓS todas as migrations anteriores
-- 
-- ============================================================================

-- ============================================================================
-- REMOVER TODAS AS POLICIES DE INSERT EXISTENTES PARA PEDIDOS
-- ============================================================================

-- Remover TODAS as policies de INSERT para evitar conflitos
-- IMPORTANTE: Execute todos os DROP antes de criar novas policies
DO $$
BEGIN
  -- Remover todas as policies de INSERT na tabela pedidos
  DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;
  DROP POLICY IF EXISTS "Permitir pedidos por mesa" ON pedidos;
  DROP POLICY IF EXISTS "Permitir criação de pedidos" ON pedidos;
  
  RAISE NOTICE '✅ Policies antigas removidas';
END $$;

-- ============================================================================
-- CRIAR UMA ÚNICA POLICY CLARA PARA INSERT DE PEDIDOS
-- ============================================================================

-- Policy única que permite:
-- 1. Pedidos de usuários autenticados (id_usuario = auth.uid())
-- 2. Pedidos de mesa via QR code (id_mesa IS NOT NULL, pode ser anônimo)
-- IMPORTANTE: Esta policy permite que usuários anônimos (anon) criem pedidos
-- desde que tenham um id_mesa válido
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
-- REMOVER E RECRIAR POLICY DE INSERT PARA ITENS_PEDIDO
-- ============================================================================

-- Remover todas as policies de INSERT na tabela itens_pedido
DO $$
BEGIN
  DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;
  DROP POLICY IF EXISTS "Permitir criação de itens de pedido" ON itens_pedido;
  
  RAISE NOTICE '✅ Policies de itens_pedido removidas';
END $$;

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
        (pedidos.id_usuario IS NOT NULL AND pedidos.id_usuario = auth.uid())
        OR
        -- Pedido de mesa (pode ser anônimo)
        pedidos.id_mesa IS NOT NULL
      )
    )
  );

-- ============================================================================
-- VERIFICAR E GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

