-- ============================================================================
-- MIGRATION 015: TESTE E DIAGNÓSTICO - RLS PEDIDOS ANON
-- ============================================================================
-- 
-- Execute este SQL para testar se as policies estão funcionando
-- e verificar se há algum problema de configuração
-- 
-- ============================================================================

-- ============================================================================
-- PASSO 1: VERIFICAR POLICIES ATUAIS
-- ============================================================================

SELECT 
  'POLICIES DE PEDIDOS:' as info,
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos' AND cmd = 'INSERT';

-- ============================================================================
-- PASSO 2: TESTAR POLICY MANUALMENTE (SIMULAÇÃO)
-- ============================================================================

-- Verificar se uma mesa existe e está ativa
SELECT 
  'MESAS DISPONÍVEIS:' as info,
  id,
  numero,
  status,
  qr_code
FROM mesas 
WHERE status IN ('livre', 'ocupada')
LIMIT 5;

-- ============================================================================
-- PASSO 3: VERIFICAR SE RLS ESTÁ HABILITADO
-- ============================================================================

SELECT 
  'RLS STATUS:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'pedidos';

-- ============================================================================
-- PASSO 4: VERIFICAR SE HÁ OUTRAS POLICIES BLOQUEANDO
-- ============================================================================

SELECT 
  'TODAS AS POLICIES DE PEDIDOS:' as info,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos'
ORDER BY cmd, policyname;

-- ============================================================================
-- PASSO 5: RECRIAR POLICY DE FORMA MAIS PERMISSIVA (TESTE)
-- ============================================================================

-- Remover TODAS as policies de anon
DROP POLICY IF EXISTS "Anon pode criar pedidos de mesa" ON pedidos;
DROP POLICY IF EXISTS "Anon pode criar itens de pedido de mesa" ON itens_pedido;

-- Criar policy ULTRA permissiva para anon (apenas verifica id_mesa)
CREATE POLICY "Anon pode criar pedidos de mesa" ON pedidos
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Apenas verificar se tem id_mesa (mais permissivo possível)
    -- Não verifica id_usuario para permitir NULL
    id_mesa IS NOT NULL
  );

-- Criar policy ULTRA permissiva para itens de pedido anon
CREATE POLICY "Anon pode criar itens de pedido de mesa" ON itens_pedido
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND pedidos.id_mesa IS NOT NULL
      -- Removida verificação de id_usuario IS NULL
    )
  );

-- ============================================================================
-- PASSO 6: VERIFICAR RESULTADO
-- ============================================================================

SELECT 
  'POLICY ATUALIZADA:' as info,
  policyname,
  roles,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos' AND policyname = 'Anon pode criar pedidos de mesa';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

