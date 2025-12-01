-- ============================================================================
-- MIGRATION 012: CORREÇÃO URGENTE - RLS PEDIDOS MESA
-- ============================================================================
-- 
-- Execute este SQL IMEDIATAMENTE no Supabase SQL Editor
-- Este script verifica e corrige as policies de forma definitiva
-- 
-- ============================================================================

-- ============================================================================
-- PASSO 1: VERIFICAR POLICIES ATUAIS
-- ============================================================================

-- Listar todas as policies de INSERT na tabela pedidos
SELECT 
  'POLICIES ATUAIS DE PEDIDOS:' as info,
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos' AND cmd = 'INSERT';

-- ============================================================================
-- PASSO 2: REMOVER TODAS AS POLICIES DE INSERT (LIMPEZA COMPLETA)
-- ============================================================================

-- Remover TODAS as policies de INSERT na tabela pedidos
DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;
DROP POLICY IF EXISTS "Permitir pedidos por mesa" ON pedidos;
DROP POLICY IF EXISTS "Permitir criação de pedidos" ON pedidos;

-- Remover TODAS as policies de INSERT na tabela itens_pedido
DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;
DROP POLICY IF EXISTS "Permitir criação de itens de pedido" ON itens_pedido;

-- ============================================================================
-- PASSO 3: CRIAR POLICY SIMPLIFICADA PARA PEDIDOS
-- ============================================================================

-- Policy que permite pedidos de mesa (anon) OU pedidos de usuários autenticados
-- IMPORTANTE: A ordem importa - verificamos id_mesa primeiro (mais permissivo)
CREATE POLICY "Permitir criação de pedidos" ON pedidos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Caso 1: Pedido de mesa (permite anon se tiver id_mesa)
    id_mesa IS NOT NULL
    OR
    -- Caso 2: Pedido de usuário autenticado (deve ser o próprio usuário)
    (id_usuario IS NOT NULL AND auth.role() = 'authenticated' AND id_usuario = auth.uid())
  );

-- ============================================================================
-- PASSO 4: CRIAR POLICY SIMPLIFICADA PARA ITENS_PEDIDO
-- ============================================================================

CREATE POLICY "Permitir criação de itens de pedido" ON itens_pedido
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND (
        -- Pedido de mesa (pode ser anônimo)
        pedidos.id_mesa IS NOT NULL
        OR
        -- OU pedido do usuário autenticado
        (pedidos.id_usuario IS NOT NULL AND auth.role() = 'authenticated' AND pedidos.id_usuario = auth.uid())
      )
    )
  );

-- ============================================================================
-- PASSO 5: VERIFICAR RESULTADO
-- ============================================================================

-- Verificar policies criadas
SELECT 
  'POLICIES CRIADAS:' as info,
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename IN ('pedidos', 'itens_pedido') AND cmd = 'INSERT'
ORDER BY tablename, policyname;

-- ============================================================================
-- PASSO 6: TESTE RÁPIDO (OPCIONAL - COMENTE SE NÃO QUISER EXECUTAR)
-- ============================================================================

-- Descomente as linhas abaixo para testar se a policy funciona
-- (substitua o UUID da mesa por um válido do seu banco)

/*
-- Teste: Verificar se uma mesa existe
SELECT id, numero, status FROM mesas WHERE status IN ('livre', 'ocupada') LIMIT 1;

-- Se a mesa existir, a policy deve permitir criar pedido com id_mesa
-- (não vamos executar o INSERT aqui, apenas verificar a estrutura)
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

