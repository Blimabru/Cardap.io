-- ============================================================================
-- MIGRATION 009: CORRIGIR RLS POLICIES PARA PEDIDOS DE MESA
-- ============================================================================
-- 
-- Este arquivo corrige as políticas RLS que estavam bloqueando pedidos
-- criados via QR code (mesa) quando o usuário não está autenticado
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Execute APÓS as migrations anteriores
-- 
-- ============================================================================

-- ============================================================================
-- CORRIGIR POLICY DE INSERT PARA PEDIDOS
-- ============================================================================

-- Remover policy antiga que bloqueava pedidos de mesa
DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;

-- Criar nova policy que permite:
-- 1. Pedidos de usuários autenticados (id_usuario = auth.uid())
-- 2. Pedidos de mesa via QR code (id_mesa IS NOT NULL, pode ser anônimo)
CREATE POLICY "Usuários criam próprios pedidos" ON pedidos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Permite se tem id_usuario e é o usuário autenticado
    (id_usuario IS NOT NULL AND id_usuario = auth.uid())
    OR
    -- Permite se tem id_mesa (pedido via QR code, pode ser anônimo)
    id_mesa IS NOT NULL
  );

-- ============================================================================
-- CORRIGIR POLICY DE INSERT PARA ITENS_PEDIDO
-- ============================================================================

-- Remover policy antiga que bloqueava itens de pedidos de mesa
DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;

-- Criar nova policy que permite itens de:
-- 1. Pedidos de usuários autenticados
-- 2. Pedidos de mesa via QR code (pode ser anônimo)
CREATE POLICY "Itens criados para próprio pedido" ON itens_pedido
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
-- VERIFICAR SE POLICY "Permitir pedidos por mesa" EXISTE E ESTÁ CORRETA
-- ============================================================================

-- Se a policy da migration 006 não foi executada, criar agora
-- Se já existe, não faz nada (DROP IF EXISTS + CREATE garante que está correta)
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
