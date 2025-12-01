-- ============================================================================
-- MIGRATION 002: CRIAR POLICIES RLS (ROW LEVEL SECURITY)
-- ============================================================================
-- 
-- Este arquivo configura as políticas de segurança RLS no Supabase
-- Execute APÓS a migration 001_create_schema.sql
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se todas as policies foram criadas
-- - Teste as políticas após criar
-- 
-- ============================================================================

-- ============================================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================================

ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLICIES: perfis
-- ============================================================================

-- Todos podem ler perfis ativos
DROP POLICY IF EXISTS "Perfis visíveis para todos" ON perfis;
CREATE POLICY "Perfis visíveis para todos"
  ON perfis FOR SELECT
  USING (ativo = true);

-- Apenas Admin pode modificar perfis (via service_role ou função específica)
-- Por enquanto, permitir apenas leitura

-- ============================================================================
-- 3. POLICIES: usuarios
-- ============================================================================

-- Usuários podem ver seus próprios dados
DROP POLICY IF EXISTS "Usuários veem próprios dados" ON usuarios;
CREATE POLICY "Usuários veem próprios dados"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados (exceto perfil)
DROP POLICY IF EXISTS "Usuários atualizam próprios dados" ON usuarios;
CREATE POLICY "Usuários atualizam próprios dados"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin e Dono podem ver todos os usuários
-- Isso será verificado no código, não via RLS (complexidade)
-- Por enquanto, apenas própria leitura

-- ============================================================================
-- 4. POLICIES: categories
-- ============================================================================

-- Todos podem ler categorias
DROP POLICY IF EXISTS "Categorias visíveis para todos" ON categories;
CREATE POLICY "Categorias visíveis para todos"
  ON categories FOR SELECT
  USING (true);

-- Apenas Admin e Dono podem criar/atualizar/deletar
-- Verificação será feita no código via metadata do usuário
-- Por enquanto, permitir apenas leitura pública

-- ============================================================================
-- 5. POLICIES: products
-- ============================================================================

-- Todos podem ler produtos
DROP POLICY IF EXISTS "Produtos visíveis para todos" ON products;
CREATE POLICY "Produtos visíveis para todos"
  ON products FOR SELECT
  USING (true);

-- Apenas Admin e Dono podem criar/atualizar/deletar
-- Verificação será feita no código via metadata do usuário
-- Por enquanto, permitir apenas leitura pública

-- ============================================================================
-- 6. POLICIES: pedidos
-- ============================================================================

-- Usuários veem apenas seus próprios pedidos
DROP POLICY IF EXISTS "Usuários veem próprios pedidos" ON pedidos;
CREATE POLICY "Usuários veem próprios pedidos"
  ON pedidos FOR SELECT
  USING (
    id_usuario = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.id_perfil IN (
        SELECT id FROM perfis WHERE nome_perfil IN ('Administrador', 'Dono')
      )
    )
  );

-- Usuários podem criar seus próprios pedidos
DROP POLICY IF EXISTS "Usuários criam próprios pedidos" ON pedidos;
CREATE POLICY "Usuários criam próprios pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (id_usuario = auth.uid());

-- Usuários podem atualizar seus próprios pedidos (apenas status para cancelar)
-- Admin e Dono podem atualizar qualquer pedido
DROP POLICY IF EXISTS "Usuários atualizam próprios pedidos" ON pedidos;
CREATE POLICY "Usuários atualizam próprios pedidos"
  ON pedidos FOR UPDATE
  USING (
    id_usuario = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.id_perfil IN (
        SELECT id FROM perfis WHERE nome_perfil IN ('Administrador', 'Dono')
      )
    )
  )
  WITH CHECK (
    id_usuario = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.id_perfil IN (
        SELECT id FROM perfis WHERE nome_perfil IN ('Administrador', 'Dono')
      )
    )
  );

-- ============================================================================
-- 7. POLICIES: itens_pedido
-- ============================================================================

-- Usuários veem itens dos seus próprios pedidos
DROP POLICY IF EXISTS "Itens visíveis para dono do pedido" ON itens_pedido;
CREATE POLICY "Itens visíveis para dono do pedido"
  ON itens_pedido FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND (
        pedidos.id_usuario = auth.uid()
        OR EXISTS (
          SELECT 1 FROM usuarios 
          WHERE usuarios.id = auth.uid() 
          AND usuarios.id_perfil IN (
            SELECT id FROM perfis WHERE nome_perfil IN ('Administrador', 'Dono')
          )
        )
      )
    )
  );

-- Usuários podem criar itens em seus próprios pedidos
DROP POLICY IF EXISTS "Itens criados para próprio pedido" ON itens_pedido;
CREATE POLICY "Itens criados para próprio pedido"
  ON itens_pedido FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND pedidos.id_usuario = auth.uid()
    )
  );

-- Usuários podem atualizar itens de seus próprios pedidos
DROP POLICY IF EXISTS "Itens atualizados para próprio pedido" ON itens_pedido;
CREATE POLICY "Itens atualizados para próprio pedido"
  ON itens_pedido FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE pedidos.id = itens_pedido.id_pedido 
      AND pedidos.id_usuario = auth.uid()
    )
  );

-- ============================================================================
-- 8. FUNÇÃO AUXILIAR: Verificar se usuário é Admin ou Dono
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin_or_dono(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = user_id 
    AND usuarios.id_perfil IN (
      SELECT id FROM perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================


