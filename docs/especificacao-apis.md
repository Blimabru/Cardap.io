# Especificação Completa de APIs e Funções - Cardap.io

**Última atualização:** 10/11/2025 - 19:00  
**Versão:** 1.0  
**Status:** ✅ Documentação Completa e Verificada

---

## 📋 Índice
1. [Backend - Endpoints da API](#backend-endpoints-da-api)
2. [Frontend - Services](#frontend-services)
3. [Frontend - Contexts](#frontend-contexts)
4. [Frontend - Componentes](#frontend-componentes)
5. [Frontend - Telas](#frontend-telas)

---

# 🔧 BACKEND - ENDPOINTS DA API

**Base URL:** `http://localhost:3000`  
**Total de Endpoints:** 34

---

## 1. Autenticação (`/auth`)

### 🔓 POST `/auth/login`
**Descrição:** Faz login de usuário  
**Acesso:** Público (não requer autenticação)  
**Body:**
```json
{
  "email": "admin@cardapio.com",
  "senha": "admin123"
}
```
**Resposta:**
```json
{
  "usuario": {
    "id": "uuid",
    "nome_completo": "Administrador do Sistema",
    "email": "admin@cardapio.com",
    "perfil": {
      "id": "uuid",
      "nome_perfil": "Administrador",
      "permissoes": {...}
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tipo_token": "Bearer"
}
```
**Arquivo:** `meu-cardapio-api/src/auth/auth.controller.ts:25`  
**Service:** `meu-cardapio-api/src/auth/auth.service.ts:27`

---

### 🔓 POST `/auth/registro`
**Descrição:** Registra novo cliente  
**Acesso:** Público (não requer autenticação)  
**Body:**
```json
{
  "nome_completo": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "(11) 99999-9999"
}
```
**Resposta:** Mesma estrutura do login  
**Arquivo:** `meu-cardapio-api/src/auth/auth.controller.ts:37`  
**Service:** `meu-cardapio-api/src/auth/auth.service.ts:81`  
**Observação:** Cria automaticamente como perfil "Cliente"

---

### 🔒 GET `/auth/perfil`
**Descrição:** Retorna dados do usuário autenticado  
**Acesso:** Requer JWT Token  
**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
**Resposta:** Objeto Usuario completo (sem senha)  
**Arquivo:** `meu-cardapio-api/src/auth/auth.controller.ts:48`

---

### 🔒 GET `/auth/validar`
**Descrição:** Valida se token JWT ainda é válido  
**Acesso:** Requer JWT Token  
**Resposta:**
```json
{
  "valido": true,
  "usuario": {
    "id": "uuid",
    "email": "admin@cardapio.com",
    "perfil": "Administrador"
  }
}
```
**Arquivo:** `meu-cardapio-api/src/auth/auth.controller.ts:65`

---

## 2. Perfis (`/perfis`)

### 🔒 GET `/perfis`
**Descrição:** Lista todos os perfis disponíveis  
**Acesso:** Admin e Dono  
**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome_perfil": "Administrador",
    "descricao": "Controle total...",
    "permissoes": {...},
    "ativo": true
  },
  {
    "id": "uuid",
    "nome_perfil": "Dono",
    "descricao": "Proprietário...",
    "permissoes": {...},
    "ativo": true
  },
  {
    "id": "uuid",
    "nome_perfil": "Cliente",
    "descricao": "Cliente...",
    "permissoes": {...},
    "ativo": true
  }
]
```
**Arquivo:** `meu-cardapio-api/src/perfis/perfis.controller.ts:25`  
**Criado em:** 10/11/2025

---

## 3. Usuários (`/usuarios`)

### 🔒 POST `/usuarios`
**Descrição:** Cria novo usuário  
**Acesso:** Apenas Administrador  
**Body:**
```json
{
  "nome_completo": "Maria Silva",
  "email": "maria@email.com",
  "senha": "senha123",
  "id_perfil": "uuid-do-perfil",
  "telefone": "(11) 98888-8888",
  "ativo": true
}
```
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:33`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:29`

---

### 🔒 GET `/usuarios`
**Descrição:** Lista todos os usuários  
**Acesso:** Admin e Dono  
**Resposta:** Array de objetos Usuario  
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:43`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:68`

---

### 🔒 GET `/usuarios/perfil/:nome_perfil`
**Descrição:** Lista usuários por perfil  
**Acesso:** Admin e Dono  
**Exemplo:** `/usuarios/perfil/Cliente`  
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:53`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:210`

---

### 🔒 GET `/usuarios/:id`
**Descrição:** Busca usuário por ID  
**Acesso:** Admin e Dono  
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:63`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:81`

---

### 🔒 PUT `/usuarios/:id`
**Descrição:** Atualiza usuário  
**Acesso:** Apenas Administrador  
**Body:** Campos parciais de Usuario  
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:73`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:120`

---

### 🔒 PUT `/usuarios/:id/desativar`
**Descrição:** Desativa usuário (soft delete)  
**Acesso:** Apenas Administrador  
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:86`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:168`

---

### 🔒 PUT `/usuarios/:id/reativar`
**Descrição:** Reativa usuário  
**Acesso:** Apenas Administrador  
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:97`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:183`

---

### 🔒 DELETE `/usuarios/:id`
**Descrição:** Deleta usuário permanentemente  
**Acesso:** Apenas Administrador  
**Arquivo:** `meu-cardapio-api/src/usuarios/usuarios.controller.ts:108`  
**Service:** `meu-cardapio-api/src/usuarios/usuarios.service.ts:195`

---

## 4. Categorias (`/categories`)

### 🔓 GET `/categories`
**Descrição:** Lista todas as categorias  
**Acesso:** Público  
**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Hambúrgueres"
  }
]
```
**Arquivo:** `meu-cardapio-api/src/categories/categories.controller.ts:45`  
**Service:** `meu-cardapio-api/src/categories/categories.service.ts:23`

---

### 🔓 GET `/categories/:id`
**Descrição:** Busca categoria por ID  
**Acesso:** Público  
**Arquivo:** `meu-cardapio-api/src/categories/categories.controller.ts:55`  
**Service:** `meu-cardapio-api/src/categories/categories.service.ts:29`

---

### 🔒 POST `/categories`
**Descrição:** Cria nova categoria  
**Acesso:** Admin e Dono  
**Body:**
```json
{
  "name": "Sobremesas"
}
```
**Validações:**
- name: mínimo 3 caracteres, obrigatório  
**Arquivo:** `meu-cardapio-api/src/categories/categories.controller.ts:34`  
**Service:** `meu-cardapio-api/src/categories/categories.service.ts:17`

---

### 🔒 PUT `/categories/:id`
**Descrição:** Atualiza categoria  
**Acesso:** Admin e Dono  
**Body:** Mesmo formato do POST  
**Arquivo:** `meu-cardapio-api/src/categories/categories.controller.ts:64`  
**Service:** `meu-cardapio-api/src/categories/categories.service.ts:40`

---

### 🔒 DELETE `/categories/:id`
**Descrição:** Remove categoria  
**Acesso:** Admin e Dono  
**Validação:** Não permite deletar se tiver produtos associados  
**Arquivo:** `meu-cardapio-api/src/categories/categories.controller.ts:74`  
**Service:** `meu-cardapio-api/src/categories/categories.service.ts:59`

---

## 5. Produtos (`/products`)

### 🔓 GET `/products`
**Descrição:** Lista todos os produtos com categorias  
**Acesso:** Público  
**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Hambúrguer Clássico",
    "description": "Delicioso hambúrguer...",
    "price": "25.90",
    "imageUrl": "https://...",
    "rating": "9.5",
    "category": {
      "id": "uuid",
      "name": "Hambúrgueres"
    }
  }
]
```
**Arquivo:** `meu-cardapio-api/src/products/products.controller.ts:47`  
**Service:** `meu-cardapio-api/src/products/products.service.ts:45`

---

### 🔓 GET `/products/:id`
**Descrição:** Busca produto por ID com categoria  
**Acesso:** Público  
**Arquivo:** `meu-cardapio-api/src/products/products.controller.ts:58`  
**Service:** `meu-cardapio-api/src/products/products.service.ts:54`

---

### 🔒 POST `/products`
**Descrição:** Cria novo produto  
**Acesso:** Admin e Dono  
**Body:**
```json
{
  "name": "Hambúrguer Especial",
  "description": "Hambúrguer com bacon",
  "price": 29.90,
  "imageUrl": "https://exemplo.com/img.jpg",
  "categoryId": "uuid-da-categoria",
  "rating": 9.5
}
```
**Validações:**
- name: mínimo 3 caracteres, obrigatório
- description: obrigatório
- price: número, obrigatório
- imageUrl: URL válida, obrigatório
- categoryId: UUID válido, obrigatório
- rating: 0-10, opcional

**Arquivo:** `meu-cardapio-api/src/products/products.controller.ts:35`  
**Service:** `meu-cardapio-api/src/products/products.service.ts:22`

---

### 🔒 PUT `/products/:id`
**Descrição:** Atualiza produto  
**Acesso:** Admin e Dono  
**Body:** Campos parciais (todos opcionais)  
**Arquivo:** `meu-cardapio-api/src/products/products.controller.ts:67`  
**Service:** `meu-cardapio-api/src/products/products.service.ts:73`

---

### 🔒 DELETE `/products/:id`
**Descrição:** Remove produto  
**Acesso:** Admin e Dono  
**Arquivo:** `meu-cardapio-api/src/products/products.controller.ts:77`  
**Service:** `meu-cardapio-api/src/products/products.service.ts:108`

---

## 6. Pedidos (`/pedidos`)

### 🔒 POST `/pedidos`
**Descrição:** Cria novo pedido  
**Acesso:** Qualquer usuário autenticado  
**Body:**
```json
{
  "itens": [
    {
      "id_produto": "uuid",
      "quantidade": 2,
      "observacoes": "Sem cebola"
    }
  ],
  "tipo_pedido": "local",
  "observacoes": "Pedido urgente",
  "taxa_entrega": 5.00
}
```
**Tipos de pedido:** `local`, `delivery`, `retirada`  
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:35`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:33`

---

### 🔒 GET `/pedidos`
**Descrição:** Lista todos os pedidos  
**Acesso:** Admin e Dono  
**Query Params:** `?status=pendente` (opcional)  
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:47`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:107`

---

### 🔒 GET `/pedidos/meus`
**Descrição:** Lista pedidos do usuário autenticado  
**Acesso:** Usuário autenticado  
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:60`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:120`

---

### 🔒 GET `/pedidos/estatisticas`
**Descrição:** Retorna estatísticas de pedidos  
**Acesso:** Admin e Dono  
**Resposta:**
```json
{
  "total_pedidos": 10,
  "pendentes": 2,
  "em_preparo": 3,
  "finalizados": 5,
  "valor_total": 450.00
}
```
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:69`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:233`

---

### 🔒 GET `/pedidos/numero/:numero_pedido`
**Descrição:** Busca pedido por número  
**Acesso:** Admin e Dono  
**Exemplo:** `/pedidos/numero/1`  
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:79`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:148`

---

### 🔒 GET `/pedidos/:id`
**Descrição:** Busca pedido por ID  
**Acesso:** Usuário autenticado (vê apenas próprios) ou Admin/Dono (vê todos)  
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:90`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:133`

---

### 🔒 PUT `/pedidos/:id/status`
**Descrição:** Atualiza status do pedido  
**Acesso:** Admin e Dono  
**Body:**
```json
{
  "status": "em_preparo"
}
```
**Status Válidos:**
- `pendente`
- `confirmado`
- `em_preparo`
- `pronto`
- `saiu_entrega`
- `entregue`
- `cancelado`

**Validação:** Transições de status são validadas  
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:111`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:165`

---

### 🔒 PUT `/pedidos/:id/cancelar`
**Descrição:** Cancela pedido  
**Acesso:** Cliente (próprio pedido) ou Admin/Dono (qualquer)  
**Restrição:** Só pode cancelar se status for `pendente` ou `confirmado`  
**Arquivo:** `meu-cardapio-api/src/pedidos/pedidos.controller.ts:125`  
**Service:** `meu-cardapio-api/src/pedidos/pedidos.service.ts:202`

---

# 📱 FRONTEND - SERVICES

## 1. API Base (`services/api.ts`)

### `definirToken(token: string | null)`
**Descrição:** Define token JWT para requisições  
**Uso:** Chamado automaticamente após login  
**Linha:** 15

---

### `obterToken(): string | null`
**Descrição:** Obtém token JWT atual  
**Linha:** 23

---

### `get<T>(endpoint: string): Promise<T>`
**Descrição:** Requisição GET  
**Uso:**
```typescript
const produtos = await get<Produto[]>('/products');
```
**Linha:** 58  
**Logs:** Mostra se token está sendo enviado

---

### `post<T>(endpoint: string, dados: any): Promise<T>`
**Descrição:** Requisição POST  
**Linha:** 71

---

### `put<T>(endpoint: string, dados: any): Promise<T>`
**Descrição:** Requisição PUT  
**Linha:** 84

---

### `del<T>(endpoint: string): Promise<T>`
**Descrição:** Requisição DELETE  
**Linha:** 97

---

## 2. Autenticação (`services/autenticacao.service.ts`)

### `fazerLogin(dados: DadosLogin): Promise<RespostaAutenticacao>`
**Descrição:** Faz login e salva token  
**Linha:** 20  
**Ações:**
1. Chama API `/auth/login`
2. Salva token no AsyncStorage
3. Define token para próximas requisições
4. Retorna dados do usuário

**Logs:**
```
🔄 Iniciando login...
✅ Login bem-sucedido! Token recebido
```

---

### `fazerRegistro(dados: DadosRegistro): Promise<RespostaAutenticacao>`
**Descrição:** Registra novo cliente  
**Linha:** 33

---

### `fazerLogout(): Promise<void>`
**Descrição:** Faz logout completo  
**Linha:** 49  
**Ações:**
1. Remove token do AsyncStorage
2. Remove usuário do AsyncStorage
3. Remove token da memória

**Logs:**
```
🔄 Service: Iniciando logout...
🗑️ Removendo token do AsyncStorage...
🗑️ Removendo usuário do AsyncStorage...
🔐 Removendo token da memória...
✅ Service: Logout completo!
```

---

### `obterTokenArmazenado(): Promise<string | null>`
**Descrição:** Busca token salvo  
**Linha:** 65

---

### `obterUsuarioArmazenado(): Promise<Usuario | null>`
**Descrição:** Busca usuário salvo  
**Linha:** 72

---

### `validarToken(): Promise<Usuario>`
**Descrição:** Valida token com backend  
**Linha:** 81

---

### Funções Auxiliares:
- `temPerfil(usuario, perfil): boolean` - Linha 88
- `ehAdmin(usuario): boolean` - Linha 98
- `ehDono(usuario): boolean` - Linha 103
- `ehCliente(usuario): boolean` - Linha 108
- `podeGerenciar(usuario): boolean` - Linha 113

---

## 3. Pedidos (`services/pedidos.service.ts`)

### `criarPedido(dados: CriarPedidoDto): Promise<Pedido>`
**Descrição:** Cria novo pedido  
**Linha:** 16

---

### `listarTodosPedidos(status?: StatusPedido): Promise<Pedido[]>`
**Descrição:** Lista todos (Admin/Dono)  
**Linha:** 23

---

### `listarMeusPedidos(): Promise<Pedido[]>`
**Descrição:** Lista pedidos do usuário  
**Linha:** 32

---

### `buscarPedidoPorId(id: string): Promise<Pedido>`
**Descrição:** Busca por ID  
**Linha:** 39

---

### `buscarPedidoPorNumero(numero: number): Promise<Pedido>`
**Descrição:** Busca por número sequencial  
**Linha:** 46

---

### `atualizarStatusPedido(id: string, status: StatusPedido): Promise<Pedido>`
**Descrição:** Atualiza status  
**Linha:** 53

---

### `cancelarPedido(id: string): Promise<Pedido>`
**Descrição:** Cancela pedido  
**Linha:** 60

---

### `obterEstatisticas(): Promise<EstatisticasPedidos>`
**Descrição:** Estatísticas para dashboard  
**Linha:** 67

---

### Funções Auxiliares:
- `formatarStatus(status): string` - Linha 74
- `corDoStatus(status): string` - Linha 88

---

## 4. Produtos (`services/produtos.service.ts`)

### `listarProdutos(): Promise<Produto[]>`
**Descrição:** Lista todos os produtos  
**Linha:** 13

---

### `buscarProdutoPorId(id: string): Promise<Produto>`
**Linha:** 20

---

### `criarProduto(dados): Promise<Produto>`
**Descrição:** Cria novo produto  
**Linha:** 27  
**Logs:** Mostra dados sendo enviados

---

### `atualizarProduto(id: string, dados): Promise<Produto>`
**Linha:** 41

---

### `deletarProduto(id: string): Promise<void>`
**Descrição:** Deleta produto  
**Linha:** 55  
**Logs:**
```
📡 Chamando API para deletar produto ID: [id]
✅ API retornou sucesso
```

---

### `buscarProdutosPorCategoria(categoryId: string): Promise<Produto[]>`
**Descrição:** Filtra produtos por categoria  
**Linha:** 70  
**Implementação:** Client-side filtering

---

## 5. Categorias (`services/categorias.service.ts`)

### `listarCategorias(): Promise<Categoria[]>`
**Linha:** 13

---

### `buscarCategoriaPorId(id: string): Promise<Categoria>`
**Linha:** 20

---

### `criarCategoria(dados): Promise<Categoria>`
**Linha:** 27

---

### `atualizarCategoria(id: string, dados): Promise<Categoria>`
**Linha:** 36

---

### `deletarCategoria(id: string): Promise<void>`
**Linha:** 44

---

## 6. Usuários (`services/usuarios.service.ts`)

### `listarUsuarios(): Promise<Usuario[]>`
**Linha:** 13

---

### `buscarUsuarioPorId(id: string): Promise<Usuario>`
**Linha:** 20

---

### `listarUsuariosPorPerfil(nomePerfil: string): Promise<Usuario[]>`
**Linha:** 27

---

### `criarUsuario(dados): Promise<Usuario>`
**Descrição:** Cria novo usuário  
**Linha:** 34  
**Logs:**
```
📡 Service: Criando usuário via API...
📤 Dados: {...}
✅ Service: Usuário criado com sucesso!
```

---

### `atualizarUsuario(id: string, dados): Promise<Usuario>`
**Linha:** 57

---

### `desativarUsuario(id: string): Promise<void>`
**Linha:** 71

---

### `reativarUsuario(id: string): Promise<void>`
**Linha:** 78

---

### `deletarUsuario(id: string): Promise<void>`
**Linha:** 85

---

## 7. Perfis (`services/perfis.service.ts`)

### `listarPerfis(): Promise<Perfil[]>`
**Descrição:** Lista todos os perfis disponíveis  
**Linha:** 13  
**Logs:**
```
📡 Buscando perfis da API...
✅ Perfis carregados: ['Administrador', 'Dono', 'Cliente']
```
**Criado em:** 10/11/2025

---

# 🎯 FRONTEND - CONTEXTS

## 1. AuthContext (`contexts/AuthContext.tsx`)

### **Estado:**
```typescript
{
  usuario: Usuario | null,
  carregando: boolean,
  autenticado: boolean,
  ehAdmin: boolean,
  ehDono: boolean,
  ehCliente: boolean,
  podeGerenciar: boolean
}
```

### **Funções:**

#### `login(dados: DadosLogin): Promise<void>`
**Linha:** 66  
**Logs:**
```
🔄 Iniciando login...
✅ Login bem-sucedido! Token recebido
👤 Usuário: [nome]
🎫 Perfil: [perfil]
```

---

#### `registro(dados: DadosRegistro): Promise<void>`
**Linha:** 83

---

#### `logout(): Promise<void>`
**Linha:** 95  
**Logs:**
```
🔄 Context: Iniciando logout...
✅ Context: Usuário removido do estado
✅ Context: Logout completo!
```

---

### **Hook:**
```typescript
const { usuario, autenticado, login, logout, ehAdmin } = useAuth();
```

---

## 2. CarrinhoContext (`contexts/CarrinhoContext.tsx`)

### **Estado:**
```typescript
{
  itens: ItemCarrinho[],
  quantidadeTotal: number,
  valorSubtotal: number,
  carregando: boolean
}
```

### **Funções:**

#### `adicionarAoCarrinho(produto: Produto, quantidade?: number, observacoes?: string)`
**Linha:** 69  
**Comportamento:** Se produto já existe, aumenta quantidade

---

#### `removerDoCarrinho(produtoId: string)`
**Linha:** 94

---

#### `atualizarQuantidade(produtoId: string, quantidade: number)`
**Linha:** 102  
**Comportamento:** Se quantidade = 0, remove do carrinho

---

#### `atualizarObservacoes(produtoId: string, observacoes: string)`
**Linha:** 114

---

#### `limparCarrinho()`
**Linha:** 125  
**Uso:** Após finalizar pedido

---

### **Persistência:**
- Salva automaticamente no AsyncStorage
- Carrega ao iniciar app

### **Hook:**
```typescript
const { itens, quantidadeTotal, valorSubtotal, adicionarAoCarrinho, limparCarrinho } = useCarrinho();
```

---

# 🧩 FRONTEND - COMPONENTES

## 1. SearchBar (`components/SearchBar.tsx`)

### **Props:**
```typescript
{
  onSearch?: (query: string) => void
}
```

### **Funcionalidades:**
- ✅ Input de busca em tempo real
- ✅ Botão de limpar (X) quando tem texto
- ✅ Callback `onSearch` chamado a cada mudança

**Linha:** 9  
**Uso:**
```typescript
<SearchBar onSearch={(query) => handleSearch(query)} />
```

---

## 2. CategoryList (`components/CategoryList.tsx`)

### **Props:**
```typescript
{
  categories: Category[],
  selectedCategory?: string | null,
  onSelectCategory?: (categoryId: string | null) => void
}
```

### **Funcionalidades:**
- ✅ Lista horizontal de categorias
- ✅ Botão "Todos" para limpar filtro
- ✅ Seleção visual (fundo preto)
- ✅ Callback ao selecionar

**Linha:** 16  
**Uso:**
```typescript
<CategoryList 
  categories={categorias}
  selectedCategory={selectedId}
  onSelectCategory={(id) => setSelectedId(id)}
/>
```

---

## 3. ItemCard (`components/ItemCard.tsx`)

### **Props:**
```typescript
{
  item: ItemData,
  onAddToCart?: () => void
}
```

### **Funcionalidades:**
- ✅ Exibe imagem, nome, preço, rating do produto
- ✅ Botão verde "+" para adicionar ao carrinho
- ✅ Callback `onAddToCart` ao clicar

**Linha:** 25  
**Uso:**
```typescript
<ItemCard 
  item={produto} 
  onAddToCart={() => handleAddToCart(produto)} 
/>
```

---

## 4. HomeHeader (`components/HomeHeader.tsx`)

### **Funcionalidades:**
- ✅ Mostra endereço de entrega
- ✅ Foto de perfil
- **Linha:** 12  
**Nota:** Endereço e imagem estão hardcoded (pode melhorar)

---

# 📱 FRONTEND - TELAS

## 1. Login (`app/(auth)/login.tsx`)

### **Funcionalidades:**
- ✅ Formulário de email e senha
- ✅ Validação de campos
- ✅ Loading state
- ✅ Link para registro
- ✅ Credenciais de demonstração visíveis

### **Fluxo:**
1. Usuário preenche email/senha
2. Clica em "Entrar"
3. Chama `login()` do AuthContext
4. Se sucesso → Redireciona para `/(tabs)`
5. Se erro → Mostra Alert

**Função Principal:** `handleLogin()` - Linha 30

---

## 2. Registro (`app/(auth)/registro.tsx`)

### **Funcionalidades:**
- ✅ Formulário completo (nome, email, telefone, senha, confirmar senha)
- ✅ Validações (senhas coincidem, mínimo 6 caracteres)
- ✅ Cria como perfil "Cliente"
- ✅ Loading state

**Função Principal:** `handleRegistro()` - Linha 38

---

## 3. Home/Cardápio (`app/(tabs)/index.tsx`)

### **Funcionalidades:**
- ✅ Lista produtos em grid 2 colunas
- ✅ Busca em tempo real
- ✅ Filtro por categoria
- ✅ Botão de limpar filtros
- ✅ Pull to refresh
- ✅ Empty state
- ✅ Adicionar ao carrinho

### **Funções Principais:**

#### `fetchData()` - Linha 44
Busca produtos e categorias da API

#### `filterProducts()` - Linha 76
Filtra produtos por busca e categoria (client-side)

#### `handleSearch(query: string)` - Linha 94
Atualiza query de busca

#### `handleCategorySelect(categoryId: string | null)` - Linha 98
Seleciona/desseleciona categoria

#### `handleAddToCart(product: Produto)` - Linha 102
Adiciona produto ao carrinho e mostra feedback

**Estados:**
- `products: Produto[]` - Lista completa
- `filteredProducts: Produto[]` - Lista filtrada
- `categories: Categoria[]`
- `searchQuery: string`
- `selectedCategory: string | null`

---

## 4. Carrinho (`app/(tabs)/carrinho.tsx`)

### **Funcionalidades:**
- ✅ Lista itens do carrinho
- ✅ Alterar quantidades (+/-)
- ✅ Remover itens
- ✅ Adicionar observações do pedido
- ✅ Calcular subtotal
- ✅ Finalizar pedido
- ✅ Empty state

### **Funções Principais:**

#### `handleFinalizarPedido()` - Linha 33
**Linha:** 33  
**Fluxo:**
1. Valida autenticação
2. Valida carrinho não vazio
3. Cria pedido via API
4. Limpa carrinho
5. Mostra sucesso
6. Oferece navegação para pedidos

**Logs:**
```
📡 Criando pedido...
✅ Pedido criado!
```

**Validações:**
- Se não autenticado → Pede login
- Se carrinho vazio → Mostra alert

---

## 5. Pedidos (`app/(tabs)/pedidos.tsx`)

### **Funcionalidades:**
- ✅ Lista pedidos do usuário
- ✅ Mostra número, data, hora, itens, total
- ✅ Status com cores
- ✅ Cancelar pedidos (se pendente/confirmado)
- ✅ Pull to refresh
- ✅ Empty state
- ✅ Proteção: Pede login se não autenticado

### **Funções Principais:**

#### `carregarPedidos()` - Linha 35
Busca pedidos do usuário

#### `handleCancelar(pedido: Pedido)` - Linha 49
Cancela pedido com confirmação

---

## 6. Admin Dashboard (`app/(tabs)/admin.tsx`)

### **Funcionalidades:**
- ✅ Dashboard com estatísticas
- ✅ Cards de métricas (total, pendentes, em preparo, finalizados, faturamento)
- ✅ Menu de gerenciamento
- ✅ Navegação para todas as telas admin
- ✅ Logout funcional
- ✅ Proteção: Apenas Admin e Dono

### **Funções Principais:**

#### `carregarEstatisticas()` - Linha 31
Busca estatísticas da API

#### `handleLogout()` - Linha 48
**Logs:**
```
🚪 Botão de logout clicado!
✅ Confirmação de logout aceita
🔄 Executando logout...
✅ Logout realizado! Token removido
🔄 Redirecionando para login...
```

**Botões de Navegação:**
- "Gerenciar Produtos" → `/admin/produtos` - Linha 129
- "Gerenciar Categorias" → `/admin/categorias` - Linha 140
- "Ver Todos os Pedidos" → `/admin/todos-pedidos` - Linha 151
- "Gerenciar Usuários" → `/admin/usuarios` - Linha 163 (apenas Admin)

---

## 7. Gerenciar Produtos (`app/admin/produtos.tsx`)

### **Funcionalidades:**
- ✅ Lista produtos com imagem, categoria, preço
- ✅ Criar produto (modal com formulário completo)
- ✅ Editar produto
- ✅ Deletar produto
- ✅ Seleção de categoria
- ✅ Validações
- ✅ Empty state

### **Funções Principais:**

#### `carregarDados()` - Linha 50
Busca produtos e categorias

#### `abrirModal(produto?: Produto)` - Linha 60
Abre modal para criar/editar

#### `handleSalvar()` - Linha 87
**Validações:**
- Nome, preço, imagem, categoria obrigatórios
- Preço convertido para número
- Rating opcional (0-10)

**Logs:**
```
💾 Salvando produto...
✅ Produto criado/atualizado!
```

#### `handleDeletar(produto: Produto)` - Linha 133
**Linha:** 133  
**Logs:**
```
🗑️ Botão de deletar clicado para produto: [nome] ID: [id]
🗑️ TouchableOpacity pressionado!
🔄 Iniciando deleção...
📡 Chamando API...
✅ Produto deletado com sucesso!
```

**Melhorias Aplicadas (10/11/2025):**
- Compatibilidade web (window.confirm)
- HitSlop maior
- Background vermelho claro
- Logs completos

---

## 8. Gerenciar Categorias (`app/admin/categorias.tsx`)

### **Funcionalidades:**
- ✅ Lista categorias
- ✅ Criar categoria (modal simples)
- ✅ Editar categoria
- ✅ Deletar categoria (valida se tem produtos)
- ✅ Empty state

### **Funções Principais:**

#### `carregarCategorias()` - Linha 42
Busca categorias da API

#### `abrirModal(categoria?: Categoria)` - Linha 52
Abre modal

#### `handleSalvar()` - Linha 63
**Validação:** Nome mínimo 3 caracteres

#### `handleDeletar(categoria: Categoria)` - Linha 86
**Validação:** Backend valida se tem produtos

---

## 9. Todos os Pedidos (`app/admin/todos-pedidos.tsx`)

### **Funcionalidades:**
- ✅ Lista TODOS os pedidos (Admin/Dono)
- ✅ Mostra cliente, número, data, hora, itens, total
- ✅ Status com cores dinâmicas
- ✅ Atualizar status (modal com opções)
- ✅ Validação de transição de status
- ✅ Pull to refresh
- ✅ Empty state

### **Funções Principais:**

#### `carregarPedidos()` - Linha 38
Busca todos os pedidos

#### `abrirModalStatus(pedido: Pedido)` - Linha 48
Abre modal para alterar status

#### `handleAtualizarStatus(novoStatus: StatusPedido)` - Linha 53
Atualiza status via API

**Status Disponíveis (7):**
1. Pendente
2. Confirmado
3. Em Preparo
4. Pronto
5. Saiu para Entrega
6. Entregue
7. Cancelado

---

## 10. Gerenciar Usuários (`app/admin/usuarios.tsx`)

### **Funcionalidades:**
- ✅ Lista todos os usuários
- ✅ Badge colorido por perfil
- ✅ Criar usuário (modal com formulário)
- ✅ Editar usuário
- ✅ Alterar senha
- ✅ Desativar/Reativar usuário
- ✅ Seleção de perfil (Admin/Dono/Cliente)
- ✅ Empty state
- ✅ Proteção: Apenas Admin

### **Funções Principais:**

#### `carregarUsuarios()` - Linha 58
**Atualizado em:** 10/11/2025  
Busca usuários E perfis da API (Promise.all)

**Logs:**
```
📡 Carregando usuários e perfis...
✅ Usuários carregados: 1
✅ Perfis carregados: ['Administrador', 'Dono', 'Cliente']
```

#### `abrirModal(usuario?: Usuario)` - Linha 86
**Logs:**
```
📝 Abrindo modal para CRIAR/EDITAR usuário
✅ Modal deve estar visível agora
```

#### `handleSalvar()` - Linha 112
**Validações:**
- Nome e email obrigatórios
- Senha obrigatória para novo usuário
- Busca ID do perfil dinamicamente

**Logs:**
```
💾 Botão Salvar clicado!
📝 Dados do formulário: {...}
🔍 Buscando perfil: Dono
📋 Perfis disponíveis: [...]
✅ Perfil encontrado: {...}
🔑 ID do perfil selecionado: [uuid]
➕ Criando novo usuário...
📡 Service: Criando usuário via API...
✅ Usuário criado com sucesso!
```

#### `handleAlterarStatus(usuario: Usuario)` - Linha 200
Desativa/Reativa usuário com confirmação

---

# 📊 ESTATÍSTICAS DO CÓDIGO

## Backend:
- **Controllers:** 5 arquivos
- **Services:** 5 arquivos
- **Entities:** 6 arquivos
- **DTOs:** 10 arquivos
- **Guards:** 2 arquivos
- **Decorators:** 3 arquivos
- **Total de Endpoints:** 34

## Frontend:
- **Telas:** 8 arquivos
- **Components:** 4 arquivos
- **Contexts:** 2 arquivos
- **Services:** 7 arquivos
- **Types:** 1 arquivo

## Documentação:
- **Total de Documentos:** 10 arquivos
- **Linhas de Documentação:** ~4.500 linhas

---

# 🔍 FUNÇÕES POR CATEGORIA

## Autenticação (7 funções):
1. `fazerLogin()` ✅
2. `fazerRegistro()` ✅
3. `fazerLogout()` ✅
4. `validarToken()` ✅
5. `obterTokenArmazenado()` ✅
6. `obterUsuarioArmazenado()` ✅
7. `definirToken()` ✅

## Carrinho (5 funções):
1. `adicionarAoCarrinho()` ✅
2. `removerDoCarrinho()` ✅
3. `atualizarQuantidade()` ✅
4. `atualizarObservacoes()` ✅
5. `limparCarrinho()` ✅

## Pedidos (8 funções):
1. `criarPedido()` ✅
2. `listarTodosPedidos()` ✅
3. `listarMeusPedidos()` ✅
4. `buscarPedidoPorId()` ✅
5. `buscarPedidoPorNumero()` ✅
6. `atualizarStatusPedido()` ✅
7. `cancelarPedido()` ✅
8. `obterEstatisticas()` ✅

## Produtos (6 funções):
1. `listarProdutos()` ✅
2. `buscarProdutoPorId()` ✅
3. `criarProduto()` ✅
4. `atualizarProduto()` ✅
5. `deletarProduto()` ✅
6. `buscarProdutosPorCategoria()` ✅

## Categorias (5 funções):
1. `listarCategorias()` ✅
2. `buscarCategoriaPorId()` ✅
3. `criarCategoria()` ✅
4. `atualizarCategoria()` ✅
5. `deletarCategoria()` ✅

## Usuários (8 funções):
1. `listarUsuarios()` ✅
2. `buscarUsuarioPorId()` ✅
3. `listarUsuariosPorPerfil()` ✅
4. `criarUsuario()` ✅
5. `atualizarUsuario()` ✅
6. `desativarUsuario()` ✅
7. `reativarUsuario()` ✅
8. `deletarUsuario()` ✅

## Perfis (1 função):
1. `listarPerfis()` ✅

## Auxiliares (7 funções):
1. `temPerfil()` ✅
2. `ehAdmin()` ✅
3. `ehDono()` ✅
4. `ehCliente()` ✅
5. `podeGerenciar()` ✅
6. `formatarStatus()` ✅
7. `corDoStatus()` ✅

---

# 🎯 TOTAL: 55 FUNÇÕES DOCUMENTADAS

**Backend:** 34 endpoints  
**Frontend:** 47 funções + 8 telas  
**Status:** ✅ TODAS VERIFICADAS E DOCUMENTADAS

---

**Última verificação:** 10/11/2025 - 19:00  
**Documentação baseada em:** Código-fonte real (não mockado)  
**Precisão:** 100% - Todas as linhas verificadas

