-- ============================================================================
-- MIGRATION 007: ADICIONAR POLICIES RLS PARA CRIAÇÃO/EDIÇÃO DE CATEGORIAS E PRODUTOS
-- ============================================================================
-- 
-- Este arquivo adiciona políticas RLS para permitir que Admin e Dono
-- possam criar, atualizar e deletar categorias e produtos
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Execute APÓS as migrations anteriores
-- 
-- ============================================================================

-- ============================================================================
-- POLICIES: categories (INSERT, UPDATE, DELETE)
-- ============================================================================

-- Admin e Dono podem criar categorias
DROP POLICY IF EXISTS "Admin e Dono criam categorias" ON categories;
CREATE POLICY "Admin e Dono criam categorias"
  ON categories FOR INSERT
  WITH CHECK (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  );

-- Admin e Dono podem atualizar categorias
DROP POLICY IF EXISTS "Admin e Dono atualizam categorias" ON categories;
CREATE POLICY "Admin e Dono atualizam categorias"
  ON categories FOR UPDATE
  USING (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  )
  WITH CHECK (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  );

-- Admin e Dono podem deletar categorias
DROP POLICY IF EXISTS "Admin e Dono deletam categorias" ON categories;
CREATE POLICY "Admin e Dono deletam categorias"
  ON categories FOR DELETE
  USING (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  );

-- ============================================================================
-- POLICIES: products (INSERT, UPDATE, DELETE)
-- ============================================================================

-- Admin e Dono podem criar produtos
DROP POLICY IF EXISTS "Admin e Dono criam produtos" ON products;
CREATE POLICY "Admin e Dono criam produtos"
  ON products FOR INSERT
  WITH CHECK (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  );

-- Admin e Dono podem atualizar produtos
DROP POLICY IF EXISTS "Admin e Dono atualizam produtos" ON products;
CREATE POLICY "Admin e Dono atualizam produtos"
  ON products FOR UPDATE
  USING (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  )
  WITH CHECK (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  );

-- Admin e Dono podem deletar produtos
DROP POLICY IF EXISTS "Admin e Dono deletam produtos" ON products;
CREATE POLICY "Admin e Dono deletam produtos"
  ON products FOR DELETE
  USING (
    (SELECT id_perfil FROM public.usuarios WHERE id = auth.uid()) IN (
      SELECT id FROM public.perfis WHERE nome_perfil IN ('Administrador', 'Dono')
    )
  );

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

