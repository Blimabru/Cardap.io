-- ============================================================================
-- MIGRATION 001: CRIAR SCHEMA COMPLETO DO SISTEMA
-- ============================================================================
-- 
-- Este arquivo cria todas as tabelas necessárias para o sistema Cardap.io
-- Execute no Supabase SQL Editor na ordem correta
-- 
-- IMPORTANTE:
-- - Execute este SQL no Supabase Dashboard > SQL Editor
-- - Verifique se todas as tabelas foram criadas
-- - Após criar, execute 002_create_rls_policies.sql
-- 
-- ============================================================================

-- ============================================================================
-- 1. TABELA: perfis
-- ============================================================================
-- Define os perfis/papéis de usuário no sistema

CREATE TABLE IF NOT EXISTS perfis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_perfil VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  permissoes JSONB DEFAULT '{}'::jsonb NOT NULL,
  ativo BOOLEAN DEFAULT true NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para busca rápida por nome
CREATE INDEX IF NOT EXISTS idx_perfis_nome ON perfis(nome_perfil);
CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis(ativo);

-- ============================================================================
-- 2. TABELA: usuarios
-- ============================================================================
-- Armazena informações dos usuários do sistema
-- NOTA: O email e senha são gerenciados pelo Supabase Auth (auth.users)
-- Esta tabela armazena dados adicionais vinculados ao auth.users.id

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  foto_perfil_url VARCHAR(500),
  id_perfil UUID NOT NULL REFERENCES perfis(id) ON DELETE RESTRICT,
  ativo BOOLEAN DEFAULT true NOT NULL,
  email_verificado BOOLEAN DEFAULT false NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil ON usuarios(id_perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- ============================================================================
-- 3. TABELA: categories
-- ============================================================================
-- Categorias de produtos do cardápio

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para busca
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- ============================================================================
-- 4. TABELA: products
-- ============================================================================
-- Produtos/itens do cardápio

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  imageUrl VARCHAR(500) NOT NULL,
  rating DECIMAL(3, 1) DEFAULT 0.0 NOT NULL,
  categoryId UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============================================================================
-- 5. TABELA: pedidos
-- ============================================================================
-- Pedidos realizados pelos clientes

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido SERIAL UNIQUE NOT NULL,
  id_usuario UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'pendente' NOT NULL,
  tipo_pedido VARCHAR(20) DEFAULT 'local' NOT NULL,
  subtotal DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  taxa_entrega DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  taxa_servico DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  observacoes TEXT,
  endereco_entrega TEXT,
  data_criacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data_atualizacao TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT check_status CHECK (status IN ('pendente', 'confirmado', 'em_preparo', 'pronto', 'saiu_entrega', 'entregue', 'cancelado')),
  CONSTRAINT check_tipo_pedido CHECK (tipo_pedido IN ('local', 'delivery', 'retirada'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_criacao ON pedidos(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero_pedido);

-- ============================================================================
-- 6. TABELA: itens_pedido
-- ============================================================================
-- Itens individuais de cada pedido

CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_pedido UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  id_produto UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantidade INTEGER DEFAULT 1 NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  observacoes TEXT,
  
  -- Constraints
  CONSTRAINT check_quantidade CHECK (quantidade > 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_produto ON itens_pedido(id_produto);

-- ============================================================================
-- 7. TRIGGERS: Atualizar data_atualizacao automaticamente
-- ============================================================================

-- Função para atualizar data_atualizacao
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com data_atualizacao
DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
CREATE TRIGGER update_perfis_updated_at
  BEFORE UPDATE ON perfis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON pedidos;
CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. SEED: Inserir perfis padrão
-- ============================================================================

-- Inserir perfis apenas se não existirem
INSERT INTO perfis (nome_perfil, descricao, permissoes, ativo)
VALUES 
  (
    'Administrador',
    'Acesso total ao sistema',
    '{"paginas": {"dashboard": {"acessar": true, "visualizar": true, "editar": true}, "produtos": {"acessar": true, "visualizar": true, "editar": true, "deletar": true}, "categorias": {"acessar": true, "visualizar": true, "editar": true, "deletar": true}, "pedidos": {"acessar": true, "visualizar": true, "editar": true, "deletar": false}, "usuarios": {"acessar": true, "visualizar": true, "editar": true, "deletar": true}}, "funcionalidades": {"criar_produto": true, "deletar_produto": true, "cancelar_pedido": true, "gerar_relatorio": true}}'::jsonb,
    true
  ),
  (
    'Dono',
    'Gerencia cardápio e pedidos',
    '{"paginas": {"dashboard": {"acessar": true, "visualizar": true, "editar": false}, "produtos": {"acessar": true, "visualizar": true, "editar": true, "deletar": true}, "categorias": {"acessar": true, "visualizar": true, "editar": true, "deletar": true}, "pedidos": {"acessar": true, "visualizar": true, "editar": true, "deletar": false}, "usuarios": {"acessar": false, "visualizar": false, "editar": false, "deletar": false}}, "funcionalidades": {"criar_produto": true, "deletar_produto": true, "cancelar_pedido": true, "gerar_relatorio": false}}'::jsonb,
    true
  ),
  (
    'Cliente',
    'Faz pedidos e visualiza histórico',
    '{"paginas": {"dashboard": {"acessar": false, "visualizar": false, "editar": false}, "produtos": {"acessar": true, "visualizar": true, "editar": false, "deletar": false}, "categorias": {"acessar": true, "visualizar": true, "editar": false, "deletar": false}, "pedidos": {"acessar": true, "visualizar": true, "editar": false, "deletar": false}, "usuarios": {"acessar": false, "visualizar": false, "editar": false, "deletar": false}}, "funcionalidades": {"criar_produto": false, "deletar_produto": false, "cancelar_pedido": true, "gerar_relatorio": false}}'::jsonb,
    true
  )
ON CONFLICT (nome_perfil) DO NOTHING;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================


