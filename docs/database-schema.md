# Esquema do Banco de Dados - Cardap.io

**Última atualização:** 10/11/2025  
**Versão:** 1.0  
**Status:** Parcialmente Implementado

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Diagrama ER](#diagrama-er)
3. [Tabelas Implementadas](#tabelas-implementadas)
4. [Tabelas Planejadas](#tabelas-planejadas)
5. [Relacionamentos](#relacionamentos)
6. [Índices](#índices)
7. [RLS (Row Level Security)](#rls)
8. [Migrations](#migrations)

---

## 🎯 Visão Geral

**Sistema de Banco de Dados:** PostgreSQL  
**ORM:** TypeORM  
**Host:** plataformatech.cloud (⚠️ Mover para .env)  
**Porta:** 5432  
**Database:** cardapio

### ⚠️ Problemas Atuais
- Credenciais hardcoded no código (CRÍTICO)
- `synchronize: true` ativo (PERIGO em produção)
- Sem migrations estruturadas
- Sem seeds para dados iniciais
- Sem índices para performance
- Sem RLS implementado

---

## 📊 Diagrama ER (Estado Atual)

```
┌─────────────────┐
│   categories    │
├─────────────────┤
│ id (PK, UUID)   │
│ name (VARCHAR)  │
└─────────────────┘
        │
        │ 1:N
        │
        ▼
┌─────────────────────────┐
│      products           │
├─────────────────────────┤
│ id (PK, UUID)           │
│ name (VARCHAR)          │
│ description (TEXT)      │
│ price (DECIMAL)         │
│ imageUrl (VARCHAR)      │
│ rating (DECIMAL)        │
│ categoryId (FK, UUID)   │
└─────────────────────────┘
```

---

## ✅ Tabelas Implementadas

### 1. `categories`
**Descrição:** Armazena as categorias de produtos do cardápio

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único da categoria |
| `name` | VARCHAR(100) | NOT NULL | Nome da categoria (ex: "Hambúrgueres", "Bebidas") |

**Relacionamentos:**
- 1:N com `products` (uma categoria pode ter vários produtos)

**Índices:**
- PRIMARY KEY em `id`

**Implementação Atual:**
```typescript
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
```

**Endpoints Implementados:**
- ✅ GET `/categories` - Listar categorias
- ✅ POST `/categories` - Criar categoria
- ✅ GET `/categories/:id` - Buscar por ID
- ❌ PUT `/categories/:id` - Atualizar (NÃO IMPLEMENTADO)
- ❌ DELETE `/categories/:id` - Deletar (NÃO IMPLEMENTADO)

---

### 2. `products`
**Descrição:** Armazena os produtos/itens do cardápio

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único do produto |
| `name` | VARCHAR(100) | NOT NULL | Nome do produto |
| `description` | TEXT | NULLABLE | Descrição detalhada do produto |
| `price` | DECIMAL(10,2) | NOT NULL | Preço do produto |
| `imageUrl` | VARCHAR | NOT NULL | URL da imagem do produto |
| `rating` | DECIMAL(3,1) | DEFAULT 0.0 | Avaliação do produto (0.0 a 10.0) |
| `categoryId` | UUID | FOREIGN KEY | Referência para `categories.id` |

**Relacionamentos:**
- N:1 com `categories` (muitos produtos pertencem a uma categoria)

**Índices:**
- PRIMARY KEY em `id`
- FOREIGN KEY em `categoryId`

**Implementação Atual:**
```typescript
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  imageUrl: string;

  @Column('decimal', { precision: 3, scale: 1, default: 0.0 })
  rating: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;
}
```

**Endpoints Implementados:**
- ✅ GET `/products` - Listar produtos
- ✅ POST `/products` - Criar produto
- ✅ GET `/products/:id` - Buscar por ID
- ❌ PUT `/products/:id` - Atualizar (NÃO IMPLEMENTADO)
- ❌ DELETE `/products/:id` - Deletar (NÃO IMPLEMENTADO)

---

## 📋 Tabelas Planejadas (Não Implementadas)

### 3. `usuarios`
**Descrição:** Armazena informações dos usuários do sistema

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `nome_completo` | VARCHAR(200) | NOT NULL | Nome completo do usuário |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email (usado para login) |
| `senha_hash` | VARCHAR(255) | NOT NULL | Senha criptografada (bcrypt) |
| `telefone` | VARCHAR(20) | NULLABLE | Telefone de contato |
| `foto_perfil_url` | VARCHAR(500) | NULLABLE | URL da foto de perfil |
| `id_perfil` | UUID | FOREIGN KEY | Referência para `perfis.id` |
| `ativo` | BOOLEAN | DEFAULT true | Se o usuário está ativo |
| `email_verificado` | BOOLEAN | DEFAULT false | Se o email foi verificado |
| `data_criacao` | TIMESTAMP | DEFAULT NOW() | Data de criação |
| `data_atualizacao` | TIMESTAMP | DEFAULT NOW() | Última atualização |

**Relacionamentos:**
- N:1 com `perfis`
- 1:N com `pedidos`
- 1:N com `enderecos`
- 1:N com `avaliacoes`

---

### 4. `perfis`
**Descrição:** Define os perfis/papéis de usuário no sistema

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `nome_perfil` | VARCHAR(50) | UNIQUE, NOT NULL | Nome do perfil (Admin, Gerente, etc.) |
| `descricao` | TEXT | NULLABLE | Descrição do perfil |
| `permissoes` | JSONB | NOT NULL | Objeto JSON com permissões |

**Perfis Padrão:**
1. **Administrador** - Acesso total
2. **Gerente** - Gestão de produtos, categorias e pedidos
3. **Garçom** - Visualizar e atualizar pedidos
4. **Cozinha** - Visualizar e atualizar status de preparo
5. **Cliente** - Fazer pedidos e visualizar histórico

**Exemplo de estrutura de permissões:**
```json
{
  "paginas": {
    "dashboard": { "acessar": true, "visualizar": true, "editar": false },
    "produtos": { "acessar": true, "visualizar": true, "editar": true, "deletar": true },
    "categorias": { "acessar": true, "visualizar": true, "editar": true, "deletar": true },
    "pedidos": { "acessar": true, "visualizar": true, "editar": true, "deletar": false },
    "usuarios": { "acessar": true, "visualizar": true, "editar": true, "deletar": false }
  },
  "funcionalidades": {
    "criar_produto": true,
    "deletar_produto": true,
    "cancelar_pedido": true,
    "gerar_relatorio": true
  }
}
```

---

### 5. `pedidos`
**Descrição:** Armazena os pedidos realizados

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `id_usuario` | UUID | FOREIGN KEY | Referência para `usuarios.id` |
| `numero_pedido` | INTEGER | UNIQUE, AUTO | Número sequencial do pedido |
| `status` | VARCHAR(50) | NOT NULL | Status do pedido |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Subtotal dos itens |
| `taxa_entrega` | DECIMAL(10,2) | DEFAULT 0.00 | Taxa de entrega |
| `taxa_servico` | DECIMAL(10,2) | DEFAULT 0.00 | Taxa de serviço |
| `total` | DECIMAL(10,2) | NOT NULL | Valor total do pedido |
| `tipo_pedido` | VARCHAR(20) | NOT NULL | "local", "delivery", "retirada" |
| `observacoes` | TEXT | NULLABLE | Observações do cliente |
| `data_criacao` | TIMESTAMP | DEFAULT NOW() | Data do pedido |
| `data_atualizacao` | TIMESTAMP | DEFAULT NOW() | Última atualização |

**Status possíveis:**
- `pendente` - Pedido criado, aguardando confirmação
- `confirmado` - Pedido confirmado
- `em_preparo` - Cozinha preparando
- `pronto` - Pedido pronto
- `saiu_entrega` - Saiu para entrega (delivery)
- `entregue` - Pedido entregue/finalizado
- `cancelado` - Pedido cancelado

**Relacionamentos:**
- N:1 com `usuarios`
- 1:N com `itens_pedido`

---

### 6. `itens_pedido`
**Descrição:** Itens individuais de cada pedido

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `id_pedido` | UUID | FOREIGN KEY | Referência para `pedidos.id` |
| `id_produto` | UUID | FOREIGN KEY | Referência para `products.id` |
| `quantidade` | INTEGER | NOT NULL, >= 1 | Quantidade do produto |
| `preco_unitario` | DECIMAL(10,2) | NOT NULL | Preço no momento do pedido |
| `subtotal` | DECIMAL(10,2) | NOT NULL | quantidade * preco_unitario |
| `observacoes` | TEXT | NULLABLE | Observações do item |

**Relacionamentos:**
- N:1 com `pedidos`
- N:1 com `products`

---

### 7. `enderecos`
**Descrição:** Endereços de entrega dos usuários

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `id_usuario` | UUID | FOREIGN KEY | Referência para `usuarios.id` |
| `apelido` | VARCHAR(50) | NOT NULL | "Casa", "Trabalho", etc. |
| `cep` | VARCHAR(10) | NOT NULL | CEP |
| `rua` | VARCHAR(200) | NOT NULL | Nome da rua |
| `numero` | VARCHAR(20) | NOT NULL | Número |
| `complemento` | VARCHAR(100) | NULLABLE | Complemento |
| `bairro` | VARCHAR(100) | NOT NULL | Bairro |
| `cidade` | VARCHAR(100) | NOT NULL | Cidade |
| `estado` | VARCHAR(2) | NOT NULL | UF |
| `principal` | BOOLEAN | DEFAULT false | Endereço principal |

**Relacionamentos:**
- N:1 com `usuarios`

---

### 8. `avaliacoes`
**Descrição:** Avaliações de produtos pelos clientes

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `id_usuario` | UUID | FOREIGN KEY | Quem avaliou |
| `id_produto` | UUID | FOREIGN KEY | Produto avaliado |
| `id_pedido` | UUID | FOREIGN KEY | Pedido relacionado |
| `nota` | DECIMAL(3,1) | NOT NULL, 0-10 | Nota (0.0 a 10.0) |
| `comentario` | TEXT | NULLABLE | Comentário |
| `data_criacao` | TIMESTAMP | DEFAULT NOW() | Data da avaliação |

**Relacionamentos:**
- N:1 com `usuarios`
- N:1 com `products`
- N:1 com `pedidos`

---

### 9. `favoritos`
**Descrição:** Produtos favoritos dos usuários

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `id_usuario` | UUID | FOREIGN KEY | Referência para `usuarios.id` |
| `id_produto` | UUID | FOREIGN KEY | Referência para `products.id` |
| `data_criacao` | TIMESTAMP | DEFAULT NOW() | Quando favoritou |

**Relacionamentos:**
- N:1 com `usuarios`
- N:1 com `products`

**Constraint Única:** (id_usuario, id_produto) - Um usuário não pode favoritar o mesmo produto duas vezes

---

### 10. `log_atividades`
**Descrição:** Log de atividades importantes do sistema

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, AUTO | Identificador único |
| `id_usuario` | UUID | FOREIGN KEY, NULLABLE | Usuário que executou |
| `acao` | VARCHAR(100) | NOT NULL | Tipo de ação |
| `tabela` | VARCHAR(50) | NULLABLE | Tabela afetada |
| `id_registro` | UUID | NULLABLE | ID do registro afetado |
| `dados_anteriores` | JSONB | NULLABLE | Estado anterior (updates) |
| `dados_novos` | JSONB | NULLABLE | Estado novo |
| `ip_origem` | VARCHAR(45) | NULLABLE | IP do usuário |
| `data_criacao` | TIMESTAMP | DEFAULT NOW() | Quando ocorreu |

---

## 🔗 Relacionamentos

### Diagrama Completo (Planejado)

```
┌──────────────┐
│   perfis     │
└──────────────┘
       │ 1:N
       ▼
┌──────────────┐        ┌──────────────┐
│  usuarios    │───────▶│  enderecos   │
└──────────────┘   1:N  └──────────────┘
   │    │   │
   │    │   └─────────────┐
   │    │                 │ 1:N
   │    │                 ▼
   │    │          ┌──────────────┐
   │    │          │  favoritos   │
   │    │          └──────────────┘
   │    │                 │
   │    │                 │ N:1
   │    │                 ▼
   │    │          ┌──────────────┐
   │    │          │  products    │
   │    │          └──────────────┘
   │    │                 │ N:1
   │    │                 │
   │    │                 ▼
   │    │          ┌──────────────┐
   │    │          │ categories   │
   │    │          └──────────────┘
   │    │
   │    │ 1:N
   │    ▼
   │  ┌──────────────┐
   │  │  avaliacoes  │
   │  └──────────────┘
   │         │ N:1
   │         ▼
   │  ┌──────────────┐
   └─▶│   pedidos    │
 1:N  └──────────────┘
             │ 1:N
             ▼
      ┌──────────────┐
      │itens_pedido  │
      └──────────────┘
             │ N:1
             ▼
      ┌──────────────┐
      │  products    │
      └──────────────┘
```

---

## 📈 Índices (Planejado)

### Índices Recomendados para Performance

```sql
-- Tabela: products
CREATE INDEX idx_products_category_id ON products(categoryId);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_price ON products(price);

-- Tabela: usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_perfil_id ON usuarios(id_perfil);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- Tabela: pedidos
CREATE INDEX idx_pedidos_usuario_id ON pedidos(id_usuario);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data_criacao ON pedidos(data_criacao DESC);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);

-- Tabela: itens_pedido
CREATE INDEX idx_itens_pedido_id ON itens_pedido(id_pedido);
CREATE INDEX idx_itens_produto_id ON itens_pedido(id_produto);

-- Tabela: avaliacoes
CREATE INDEX idx_avaliacoes_produto_id ON avaliacoes(id_produto);
CREATE INDEX idx_avaliacoes_usuario_id ON avaliacoes(id_usuario);

-- Tabela: favoritos
CREATE UNIQUE INDEX idx_favoritos_usuario_produto ON favoritos(id_usuario, id_produto);

-- Tabela: enderecos
CREATE INDEX idx_enderecos_usuario_id ON enderecos(id_usuario);
CREATE INDEX idx_enderecos_principal ON enderecos(id_usuario, principal) WHERE principal = true;
```

---

## 🔒 RLS (Row Level Security) - Planejado

### Políticas de Segurança

⚠️ **Atualmente NÃO implementado**

#### Tabela: products
```sql
-- Todos podem ler produtos ativos
CREATE POLICY "Produtos visíveis para todos"
  ON products FOR SELECT
  USING (true);

-- Apenas admin e gerente podem inserir/atualizar/deletar
CREATE POLICY "Apenas admin/gerente modificam produtos"
  ON products FOR ALL
  USING (
    auth.jwt() ->> 'perfil' IN ('administrador', 'gerente')
  );
```

#### Tabela: pedidos
```sql
-- Usuários veem apenas seus próprios pedidos
CREATE POLICY "Usuários veem seus pedidos"
  ON pedidos FOR SELECT
  USING (
    id_usuario = auth.uid()
    OR auth.jwt() ->> 'perfil' IN ('administrador', 'gerente', 'garcom')
  );

-- Apenas o próprio usuário pode criar pedido
CREATE POLICY "Usuários criam seus pedidos"
  ON pedidos FOR INSERT
  WITH CHECK (id_usuario = auth.uid());
```

---

## 🔄 Migrations (Planejado)

### Status Atual
❌ **Sem migrations estruturadas**
- Usando `synchronize: true` (perigoso)
- Nenhuma migration criada

### Migrations Necessárias

1. **001_criar_tabelas_basicas.ts**
   - Criar `categories`
   - Criar `products`

2. **002_criar_sistema_usuarios.ts**
   - Criar `perfis`
   - Criar `usuarios`

3. **003_criar_sistema_pedidos.ts**
   - Criar `pedidos`
   - Criar `itens_pedido`

4. **004_criar_enderecos_favoritos.ts**
   - Criar `enderecos`
   - Criar `favoritos`

5. **005_criar_avaliacoes_logs.ts**
   - Criar `avaliacoes`
   - Criar `log_atividades`

6. **006_adicionar_indices.ts**
   - Criar todos os índices de performance

---

## 📝 Seeds (Planejado)

### Seeds Necessários

1. **perfis.seed.ts**
   - Inserir 5 perfis padrão (Admin, Gerente, Garçom, Cozinha, Cliente)
   - Definir permissões para cada perfil

2. **usuarios.seed.ts**
   - Criar usuário administrador padrão
   - Criar usuários de teste para cada perfil

3. **categories.seed.ts**
   - Inserir categorias básicas (Hambúrgueres, Bebidas, Sobremesas, etc.)

4. **products.seed.ts**
   - Inserir produtos de exemplo para cada categoria

---

## 🚨 Ações Urgentes

1. **IMEDIATO:**
   - [ ] Mover credenciais para `.env`
   - [ ] Desativar `synchronize: true`
   - [ ] Criar arquivo de configuração do banco

2. **ALTA PRIORIDADE:**
   - [ ] Criar todas as migrations
   - [ ] Criar seeds para perfis e usuários
   - [ ] Implementar tabelas de usuários e permissões
   - [ ] Adicionar índices básicos

3. **MÉDIA PRIORIDADE:**
   - [ ] Implementar RLS
   - [ ] Criar tabelas de pedidos
   - [ ] Adicionar triggers para auditoria

---

**Histórico de Mudanças Recentes:**
- 10/11/2025 - Documento criado com estrutura atual e planejada do banco


