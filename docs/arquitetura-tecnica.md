# Arquitetura Técnica - Cardap.io

**Última atualização:** 10/11/2025  
**Versão:** 1.0  
**Status:** Em Desenvolvimento

---

## 📋 Índice
1. [Stack Tecnológica](#stack-tecnológica)
2. [Arquitetura Geral](#arquitetura-geral)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Banco de Dados](#banco-de-dados)
6. [Infraestrutura](#infraestrutura)
7. [Segurança](#segurança)
8. [Decisões Arquiteturais](#decisões-arquiteturais)

---

## 🛠️ Stack Tecnológica

### Frontend (Mobile)
- **Framework:** React Native 0.81.5
- **Navigation:** Expo Router 6.0.13
- **Runtime:** Expo 54.0.20
- **Linguagem:** TypeScript 5.9.2
- **UI Components:** React Native core + Expo Vector Icons
- **Estado:** React Hooks (useState, useEffect)
- **Package Manager:** npm

#### Dependências Principais
```json
{
  "expo": "~54.0.20",
  "expo-router": "~6.0.13",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "@expo/vector-icons": "^15.0.3"
}
```

### Backend (API)
- **Framework:** NestJS 11.0.1
- **Linguagem:** TypeScript 5.7.3
- **ORM:** TypeORM 0.3.27
- **Runtime:** Node.js
- **Validação:** class-validator 0.14.2 + class-transformer 0.5.1
- **Package Manager:** npm

#### Dependências Principais
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/core": "^11.0.1",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/typeorm": "^11.0.0",
  "typeorm": "^0.3.27",
  "pg": "^8.16.3",
  "class-validator": "^0.14.2",
  "class-transformer": "^0.5.1"
}
```

### Banco de Dados
- **SGBD:** PostgreSQL
- **Host:** plataformatech.cloud
- **Porta:** 5432
- **Database:** cardapio
- **ORM:** TypeORM

### Planejado (Não Implementado)
- **Autenticação:** JWT (@nestjs/jwt)
- **Autorização:** Guards customizados
- **Upload de Arquivos:** Multer
- **Cache:** Redis (futuro)
- **Estado Global:** Context API ou Zustand (futuro)
- **Push Notifications:** Expo Notifications (futuro)

---

## 🏗️ Arquitetura Geral

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────┐
│         MOBILE APP (React Native)       │
│  ┌────────────────────────────────────┐ │
│  │  Screens (Home, Product, Cart...)  │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Components (Reusable UI)          │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Services (API Calls)              │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    │ HTTP/HTTPS
                    │ (REST API)
                    ▼
┌─────────────────────────────────────────┐
│         API SERVER (NestJS)             │
│  ┌────────────────────────────────────┐ │
│  │  Controllers (Rotas HTTP)          │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Services (Lógica de Negócio)     │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Entities (Modelos TypeORM)       │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Guards/Middlewares                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    │ SQL
                    │ (TypeORM)
                    ▼
┌─────────────────────────────────────────┐
│         DATABASE (PostgreSQL)           │
│  ┌────────────────────────────────────┐ │
│  │  Tabelas (categories, products...) │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Índices, Constraints, Triggers    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Padrão de Arquitetura
**Modelo:** 3-Tier Architecture (Camadas)

1. **Camada de Apresentação (Frontend)**
   - React Native
   - Responsável pela UI/UX
   - Comunicação via API REST

2. **Camada de Aplicação (Backend)**
   - NestJS com TypeORM
   - Lógica de negócio
   - Validações
   - Autenticação/Autorização

3. **Camada de Dados (Database)**
   - PostgreSQL
   - Persistência de dados
   - RLS (planejado)

---

## 🔧 Backend

### Estrutura do Projeto

```
meu-cardapio-api/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Módulo raiz
│   ├── app.controller.ts          # Controller raiz
│   ├── app.service.ts             # Service raiz
│   │
│   ├── category.entity.ts         # ⚠️ Entidade solta (deveria estar em pasta)
│   ├── product.entity.ts          # ⚠️ Entidade solta (deveria estar em pasta)
│   │
│   ├── categories/                # Módulo de Categorias
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts # Duplicado
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   └── products/                  # Módulo de Produtos
│       ├── products.module.ts
│       ├── products.controller.ts
│       ├── products.service.ts
│       ├── entities/
│       │   └── product.entity.ts  # Duplicado
│       └── dto/
│           ├── create-product.dto.ts
│           └── update-product.dto.ts
│
├── test/                          # Testes e2e
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### ⚠️ Problemas na Estrutura Backend
1. Entidades duplicadas (category.entity.ts e product.entity.ts em 2 lugares)
2. Sem pasta `/auth` para autenticação
3. Sem pasta `/common` para middlewares, guards, filters
4. Sem pasta `/config` para configurações
5. Sem pasta `/database` para migrations e seeds

### Estrutura Recomendada

```
meu-cardapio-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── auth/                      # ❌ NÃO EXISTE
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── usuarios/                  # ❌ NÃO EXISTE
│   │   ├── usuarios.module.ts
│   │   ├── usuarios.service.ts
│   │   ├── usuarios.controller.ts
│   │   └── entities/
│   │       └── usuario.entity.ts
│   │
│   ├── perfis/                    # ❌ NÃO EXISTE
│   │   └── ...
│   │
│   ├── pedidos/                   # ❌ NÃO EXISTE
│   │   └── ...
│   │
│   ├── categories/                # ✅ EXISTE (parcial)
│   ├── products/                  # ✅ EXISTE (parcial)
│   │
│   ├── common/                    # ❌ NÃO EXISTE
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   ├── config/                    # ❌ NÃO EXISTE
│   │   ├── database.config.ts
│   │   └── app.config.ts
│   │
│   └── database/                  # ❌ NÃO EXISTE
│       ├── migrations/
│       └── seeds/
│
└── ...
```

### Fluxo de Requisição (Atual)

```
Cliente (App)
    │
    │ HTTP Request
    ▼
Controller (ex: products.controller.ts)
    │
    │ Chama método
    ▼
Service (ex: products.service.ts)
    │
    │ Usa Repository
    ▼
TypeORM Repository
    │
    │ Query SQL
    ▼
PostgreSQL
    │
    │ Resultado
    ▼
Service → Controller → Cliente
```

### Fluxo Planejado (Com Autenticação)

```
Cliente (App)
    │
    │ HTTP Request + JWT Token
    ▼
Guards (JWT + Roles)  ← ❌ NÃO IMPLEMENTADO
    │
    │ Se autorizado
    ▼
Controller
    │
    ▼
Service
    │
    ▼
TypeORM Repository
    │
    ▼
PostgreSQL (com RLS)  ← ❌ NÃO IMPLEMENTADO
```

---

## 📱 Frontend

### Estrutura do Projeto

```
Cardap.io/
├── app/                           # Rotas (Expo Router)
│   ├── _layout.tsx                # Layout raiz
│   └── (tabs)/                    # Grupo de tabs
│       ├── _layout.tsx            # Layout das tabs
│       ├── index.tsx              # Home (Cardápio)
│       └── explore.tsx            # ❌ NÃO EXISTE (referenciado mas não criado)
│
├── components/                    # Componentes reutilizáveis
│   ├── HomeHeader.tsx             # ✅ Header da home
│   ├── SearchBar.tsx              # ✅ Barra de busca (sem funcionalidade)
│   ├── CategoryList.tsx           # ✅ Lista de categorias
│   └── ItemCard.tsx               # ✅ Card de produto
│
├── constants/                     # Constantes
│   ├── api.ts                     # URL da API
│   └── theme.ts                   # Cores e estilos
│
├── hooks/                         # Custom hooks
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
│
├── assets/                        # Imagens e recursos
│   └── images/
│       └── hamburguer.png
│
├── package.json
└── tsconfig.json
```

### ⚠️ Problemas na Estrutura Frontend
1. Sem pasta `/services` para chamadas de API
2. Sem pasta `/contexts` para gerenciamento de estado
3. Sem pasta `/types` para tipos TypeScript globais
4. Sem pasta `/screens` (tudo está em `/app`)
5. Sem pasta `/utils` para funções auxiliares
6. Tab "explore" definida mas não implementada

### Estrutura Recomendada

```
Cardap.io/
├── app/                           # Rotas
│   ├── (tabs)/
│   │   ├── index.tsx              # Home
│   │   ├── explorar.tsx           # ❌ CRIAR
│   │   ├── carrinho.tsx           # ❌ CRIAR
│   │   └── perfil.tsx             # ❌ CRIAR
│   ├── (auth)/                    # ❌ CRIAR - Grupo de autenticação
│   │   ├── login.tsx
│   │   └── registro.tsx
│   ├── produto/[id].tsx           # ❌ CRIAR - Detalhes do produto
│   └── ...
│
├── components/                    # ✅ EXISTE
│
├── contexts/                      # ❌ CRIAR
│   ├── AuthContext.tsx            # Contexto de autenticação
│   ├── CartContext.tsx            # Contexto do carrinho
│   └── ThemeContext.tsx
│
├── services/                      # ❌ CRIAR
│   ├── api.ts                     # Cliente Axios/Fetch
│   ├── produtosService.ts
│   ├── categoriasService.ts
│   ├── pedidosService.ts
│   └── authService.ts
│
├── types/                         # ❌ CRIAR
│   ├── Produto.ts
│   ├── Categoria.ts
│   ├── Usuario.ts
│   └── Pedido.ts
│
├── utils/                         # ❌ CRIAR
│   ├── formatters.ts              # Formatação de preço, data, etc.
│   ├── validators.ts
│   └── storage.ts                 # AsyncStorage helpers
│
└── constants/                     # ✅ EXISTE
```

### Fluxo de Dados (Atual)

```
Screen (index.tsx)
    │
    │ useEffect
    ▼
fetch() direto                     ← ⚠️ Não ideal
    │
    │ HTTP
    ▼
API (localhost:3000)               ← ⚠️ Hardcoded
    │
    │ Resposta
    ▼
setState
    │
    ▼
Renderiza Components
```

### Fluxo Recomendado

```
Screen
    │
    ▼
Custom Hook (useProdutos)          ← ❌ NÃO EXISTE
    │
    ▼
Service (produtosService)          ← ❌ NÃO EXISTE
    │
    ▼
API Client (com interceptors)      ← ❌ NÃO EXISTE
    │
    ▼
API Backend
```

---

## 🗄️ Banco de Dados

### Configuração Atual

**Arquivo:** `meu-cardapio-api/src/app.module.ts`

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'plataformatech.cloud',      // ⚠️ HARDCODED
  port: 5432,
  username: 'cardapio',              // ⚠️ HARDCODED
  password: 'nndXSiW6Wtjc664S',     // ⚠️ HARDCODED - CRÍTICO!
  database: 'cardapio',              // ⚠️ HARDCODED
  entities: [Category, Product],
  synchronize: true,                 // ⚠️ PERIGO EM PRODUÇÃO
})
```

### ⚠️ Problemas Críticos
1. **Credenciais expostas** no código
2. **synchronize: true** - pode causar perda de dados em produção
3. Sem migrations estruturadas
4. Sem seeds para dados iniciais

### Configuração Recomendada

**Arquivo:** `.env`
```
DB_HOST=plataformatech.cloud
DB_PORT=5432
DB_USERNAME=cardapio
DB_PASSWORD=nndXSiW6Wtjc664S
DB_DATABASE=cardapio
```

**Arquivo:** `database.config.ts`
```typescript
import { ConfigService } from '@nestjs/config';

export const databaseConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
  synchronize: false,                  // ✅ SEGURO
  logging: process.env.NODE_ENV === 'development',
};
```

---

## 🚀 Infraestrutura

### Ambiente Atual
- **Desenvolvimento:** Local (localhost)
- **Backend:** Roda em `http://localhost:3000`
- **Frontend:** Expo Dev (mobile emulator/device)
- **Banco:** Servidor remoto (plataformatech.cloud)

### Ambientes Planejados

#### Desenvolvimento
- Backend: localhost:3000
- Frontend: Expo Dev
- Banco: Dev database

#### Staging (Homologação)
- Backend: API em servidor de staging
- Frontend: Build de teste
- Banco: Staging database

#### Produção
- Backend: API em servidor produção
- Frontend: Build production (App Stores)
- Banco: Production database
- CDN: Para imagens de produtos

---

## 🔒 Segurança

### Implementado
- ✅ TypeORM (previne SQL Injection básico)
- ✅ HTTPS (assumindo em produção)

### NÃO Implementado (CRÍTICO)
- ❌ Autenticação (JWT)
- ❌ Autorização (Guards/Roles)
- ❌ Validação de dados (DTOs incompletos)
- ❌ Rate limiting
- ❌ CORS configurado
- ❌ Helmet (security headers)
- ❌ Criptografia de senhas
- ❌ RLS no banco de dados
- ❌ Variáveis de ambiente

### Plano de Segurança

1. **Autenticação:**
   - JWT tokens
   - Refresh tokens
   - Expiração de sessão

2. **Autorização:**
   - Role-based access control (RBAC)
   - Guards do NestJS
   - Decoradores customizados

3. **Validação:**
   - class-validator em todos os DTOs
   - Pipes de validação
   - Sanitização de inputs

4. **Banco de Dados:**
   - RLS (Row Level Security)
   - Prepared statements (TypeORM)
   - Backup automatizado

5. **API:**
   - Rate limiting (ThrottleGuard)
   - CORS restritivo
   - Helmet para headers
   - Logs de auditoria

---

## 🎯 Decisões Arquiteturais

### Por que NestJS?
- Framework opinado (estrutura clara)
- TypeScript nativo
- Dependency Injection
- Modular e escalável
- Boa documentação

### Por que TypeORM?
- TypeScript first
- Active Record + Data Mapper
- Migrations
- Integração com NestJS

### Por que React Native (Expo)?
- Cross-platform (iOS + Android)
- Expo Router simplifica navegação
- Hot reload rápido
- Fácil acesso a APIs nativas

### Por que PostgreSQL?
- Robusto e confiável
- JSONB para dados flexíveis
- RLS nativo
- Performance

---

## 📈 Escalabilidade (Futuro)

### Possíveis Melhorias
1. **Cache:** Redis para dados frequentes
2. **CDN:** CloudFlare/AWS S3 para imagens
3. **Load Balancer:** Múltiplas instâncias da API
4. **Microservices:** Separar pedidos, produtos, auth
5. **Message Queue:** RabbitMQ/SQS para processamento assíncrono
6. **Monitoramento:** Sentry, DataDog, New Relic

---

**Histórico de Mudanças Recentes:**
- 10/11/2025 - Documento criado com arquitetura atual e recomendações


