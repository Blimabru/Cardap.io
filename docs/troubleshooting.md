# Troubleshooting - Cardap.io

**Última atualização:** 10/11/2025  
**Versão:** 1.0  
**Status:** Ativo

---

## 📋 Índice
1. [Problemas do Backend](#problemas-do-backend)
2. [Problemas do Frontend](#problemas-do-frontend)
3. [Problemas do Banco de Dados](#problemas-do-banco-de-dados)
4. [Soluções Rápidas](#soluções-rápidas)

---

## 🔴 PROBLEMAS DO BACKEND

### Erro: "Cannot find module"

**Sintoma:** Backend não inicia, erro de módulo não encontrado

**Solução:**
```bash
cd meu-cardapio-api
rm -rf node_modules
rm package-lock.json
npm install
```

---

### Erro: "Authentication failed for user"

**Sintoma:** Seed ou backend falha ao conectar no banco

**Causa:** Arquivo `.env` não existe ou está incorreto

**Solução:**
1. Criar arquivo `meu-cardapio-api/.env`:
```bash
DB_HOST=plataformatech.cloud
DB_PORT=5432
DB_USERNAME=cardapio
DB_PASSWORD=nndXSiW6Wtjc664S
DB_DATABASE=cardapio
JWT_SECRET=cardapio_jwt_secret_2025_super_seguro
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081,exp://192.168.0.1:8081
```

---

### Erro: "Cannot find Perfil 'Cliente'"

**Sintoma:** Registro de usuário falha

**Causa:** Seeds não foram executados

**Solução:**
```bash
cd meu-cardapio-api
npm run seed
```

---

### Erro TypeScript: "Type 'X' is not assignable"

**Sintoma:** Backend não compila

**Solução:** Verificar tipos no código, garantir que todos os métodos retornam tipos corretos

---

## 🔴 PROBLEMAS DO FRONTEND

### Erro: "Cannot find module './generated/ParserVisitorKeys'"

**Sintoma:** Expo não inicia, erro do hermes-parser

**Causa:** node_modules corrompido ou instalação incompleta

**Solução COMPLETA:**
```bash
# Parar todos os processos do Expo/Metro
# Fechar janelas do terminal

# Na raiz do projeto:
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm cache clean --force
npm install
npx expo start --clear
```

**Solução RÁPIDA:**
```bash
npx expo start --clear
```

---

### Erro: "Metro bundling failed"

**Sintoma:** App fica em tela branca, erro no console

**Causa:** Cache corrompido ou erro de sintaxe

**Solução:**
```bash
npx expo start --clear
```

Se não resolver:
```bash
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear
```

---

### Erro: "Network request failed"

**Sintoma:** App não conecta com API

**Causa:** Backend não está rodando ou URL incorreta

**Solução:**
1. Verificar se backend está rodando em `http://localhost:3000`
2. Verificar arquivo `constants/api.ts`:
```typescript
export const API_URL = 'http://localhost:3000';
```
3. Se estiver em dispositivo físico, use o IP da máquina:
```typescript
export const API_URL = 'http://192.168.X.X:3000';
```

---

### Erro: "Cannot find module '@react-native-async-storage/async-storage'"

**Sintoma:** Erro ao importar AsyncStorage

**Solução:**
```bash
npm install @react-native-async-storage/async-storage
```

---

### App fica em tela branca

**Possíveis causas:**
1. Erro de importação não tratado
2. Context não envolvendo o app
3. Erro na navegação

**Solução:**
1. Verificar console do Expo para erros
2. Testar com `npx expo start --clear`
3. Verificar se `app/_layout.tsx` está correto com Providers

---

## 🔴 PROBLEMAS DO BANCO DE DADOS

### Erro: "relation 'usuarios' does not exist"

**Sintoma:** API retorna erro ao acessar tabelas

**Causa:** Tabelas não foram criadas

**Solução:**
```bash
# Backend deve estar com synchronize: true em desenvolvimento
# Ou rodar migrations (quando implementadas)

# No arquivo database.config.ts:
synchronize: process.env.NODE_ENV === 'development',
```

---

### Erro: "duplicate key value violates unique constraint"

**Sintoma:** Não consegue criar usuário/categoria

**Causa:** Email ou nome já existe

**Solução:** Usar email/nome diferente ou deletar registro anterior

---

## ⚡ SOLUÇÕES RÁPIDAS

### Reset Completo do Frontend
```bash
rm -rf node_modules
rm -rf .expo
rm -rf node_modules/.cache
rm package-lock.json
npm cache clean --force
npm install
npx expo start --clear
```

### Reset Completo do Backend
```bash
cd meu-cardapio-api
rm -rf node_modules
rm -rf dist
rm package-lock.json
npm install
npm run start:dev
```

### Recriar Banco de Dados
```bash
# Conectar no PostgreSQL e dropar/recriar banco
# Depois rodar seeds:
cd meu-cardapio-api
npm run seed
```

---

## 🔧 COMANDOS ÚTEIS

### Limpar Cache Completo
```bash
# Frontend
npx expo start --clear
watchman watch-del-all (se tiver watchman)
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# Backend
rm -rf dist
rm -rf node_modules
npm install
```

### Ver Logs Detalhados
```bash
# Backend
npm run start:dev

# Frontend
npx expo start --clear
```

### Testar API Manualmente
```bash
# Listar categorias
curl http://localhost:3000/categories

# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cardapio.com","senha":"admin123"}'
```

---

## 📞 AINDA COM PROBLEMAS?

1. Verifique se Node.js está atualizado (>=18)
2. Verifique se tem conexão com o banco
3. Verifique se as portas 3000 e 8081 estão livres
4. Tente reiniciar o computador (sério, às vezes resolve!)

---

**Histórico de Mudanças:**
- 10/11/2025 - Documento criado com soluções para problemas comuns

