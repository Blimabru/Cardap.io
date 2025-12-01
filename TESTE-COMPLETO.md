# 🧪 GUIA DE TESTE COMPLETO - Cardap.io

**Data:** 10/11/2025  
**Versão:** 1.0

---

## ✅ PRÉ-REQUISITOS

### 1. Backend DEVE estar rodando

```bash
cd meu-cardapio-api
npm run start:dev
```

**Aguarde ver:**
```
🚀 Servidor rodando em: http://localhost:3000
```

### 2. Seeds executados

```bash
cd meu-cardapio-api
npm run seed
```

**Deve criar:**
- ✅ Perfis (Admin, Dono, Cliente)
- ✅ Usuário admin@cardapio.com / admin123

---

## 🔧 SE ERRO 401 (Unauthorized)

### Causa Provável:
- ❌ Backend NÃO está rodando
- ❌ Você NÃO fez login
- ❌ Token expirou

### Solução:

#### 1. Verificar se Backend está rodando:
Abra navegador em: `http://localhost:3000`

**Se der erro de conexão** → Backend NÃO está rodando!

#### 2. Fazer Login no App:
1. Abrir o app
2. Você DEVE ver tela de **LOGIN**
3. Entrar com:
   - Email: `admin@cardapio.com`
   - Senha: `admin123`
4. Clicar em **"Entrar"**
5. Deve redirecionar para o cardápio

#### 3. Testar Autenticação:
Após login, ir para tab **"Admin"** → Deve mostrar dashboard

Se ainda der erro 401:
- Limpar cache do app
- Fazer logout e login novamente
- Verificar console do backend para erros

---

## 🧪 TESTE PASSO A PASSO

### TESTE 1: Login ✅

1. Abrir app
2. Ver tela de LOGIN
3. Entrar com `admin@cardapio.com` / `admin123`
4. Deve entrar no cardápio

**Resultado Esperado:** Login bem-sucedido, token salvo

---

### TESTE 2: Cardápio (Cliente) ✅

1. Ver lista de produtos
2. Buscar por nome (digitar na barra de busca)
3. Filtrar por categoria (clicar em uma categoria)
4. Clicar em "Limpar Filtros"
5. Clicar no botão verde "+" de um produto

**Resultado Esperado:** Produto adicionado ao carrinho, badge aparece

---

### TESTE 3: Carrinho ✅

1. Ir para tab "Carrinho"
2. Ver produto adicionado
3. Alterar quantidade (+/-)
4. Adicionar observação
5. Clicar em "Finalizar Pedido"

**Resultado Esperado:** 
- Pedido criado
- Carrinho limpo
- Alert de sucesso

---

### TESTE 4: Pedidos ✅

1. Ir para tab "Pedidos"
2. Ver pedido recém-criado
3. Tentar cancelar (se pendente)

**Resultado Esperado:** Lista de pedidos do usuário

---

### TESTE 5: Admin - Dashboard ✅

1. Ir para tab "Admin"
2. Ver estatísticas (total de pedidos, valores, etc.)
3. **CLICAR em cada botão:**

**Resultado Esperado:** Cada botão deve NAVEGAR para tela respectiva

---

### TESTE 6: Gerenciar Produtos ✅

1. No Admin, clicar em **"Gerenciar Produtos"**
2. Deve abrir tela de produtos
3. Clicar no **"+" verde** (topo direito)
4. Preencher formulário:
   - Nome: Hambúrguer Clássico
   - Descrição: Delicioso hambúrguer
   - Preço: 25.90
   - URL Imagem: https://exemplo.com/hamburguer.jpg
   - Selecionar categoria
   - Avaliação: 9.5
5. Clicar em "Criar Produto"

**Resultado Esperado:** Produto criado, aparece na lista

---

### TESTE 7: Editar Produto ✅

1. Na lista de produtos, clicar no **ícone azul (editar)**
2. Modificar nome ou preço
3. Clicar em "Atualizar Produto"

**Resultado Esperado:** Produto atualizado

---

### TESTE 8: Deletar Produto ✅

1. Na lista de produtos, clicar no **ícone vermelho (deletar)**
2. Confirmar exclusão

**Resultado Esperado:** Produto removido da lista

---

### TESTE 9: Gerenciar Categorias ✅

1. No Admin, clicar em **"Gerenciar Categorias"**
2. Clicar no **"+" verde**
3. Digitar nome: "Sobremesas"
4. Clicar em "Criar"

**Resultado Esperado:** Categoria criada

---

### TESTE 10: Todos os Pedidos ✅

1. No Admin, clicar em **"Ver Todos os Pedidos"**
2. Ver lista de TODOS os pedidos
3. **Clicar no status colorido** de um pedido
4. Selecionar novo status

**Resultado Esperado:** Status atualizado

---

### TESTE 11: Gerenciar Usuários (Admin) ✅

1. No Admin, clicar em **"Gerenciar Usuários"**
2. Ver lista de usuários
3. Clicar no **"+" verde**
4. Preencher:
   - Nome: João Silva
   - Email: joao@teste.com
   - Senha: senha123
   - Perfil: Dono
5. Criar usuário

**Resultado Esperado:** Novo usuário criado

---

### TESTE 12: Logout ✅

1. No Admin, clicar no **ícone vermelho (porta)** no topo
2. Confirmar saída

**Resultado Esperado:** 
- Logout realizado
- Redirecionado para login
- Token removido

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Erro 401 em TODAS as requisições

**Causa:** Token não está sendo enviado

**Solução:**
1. Verificar se backend está rodando
2. Fazer LOGOUT completo
3. Fazer LOGIN novamente
4. Testar novamente

### Botão não navega

**Causa:** Possível erro de rota

**Solução:** Verificar console do Expo para erros

### Modal não abre

**Causa:** Estado não atualizando

**Solução:** Recarregar o app (r no terminal do Expo)

---

## 📊 CHECKLIST DE FUNCIONALIDADES

### Backend:
- [ ] Rodando em http://localhost:3000
- [ ] Seeds executados
- [ ] Usuário admin criado

### Frontend:
- [ ] App carregando sem erros
- [ ] Tela de login aparece primeiro
- [ ] Login funciona
- [ ] Token é salvo

### Cardápio (Cliente):
- [ ] Lista produtos
- [ ] Busca funciona
- [ ] Filtro por categoria funciona
- [ ] Botão adicionar ao carrinho funciona
- [ ] Badge atualiza

### Carrinho:
- [ ] Mostra produtos
- [ ] Alterar quantidade funciona
- [ ] Finalizar pedido funciona
- [ ] Carrinho limpa após pedido

### Pedidos:
- [ ] Lista pedidos do usuário
- [ ] Pode cancelar pedidos

### Admin:
- [ ] Dashboard mostra estatísticas
- [ ] **TODOS os botões navegam**
- [ ] Gerenciar Produtos funciona
- [ ] Gerenciar Categorias funciona
- [ ] Todos os Pedidos funciona
- [ ] Gerenciar Usuários funciona (Admin)
- [ ] Logout funciona

---

## 🎯 SE TUDO FUNCIONAR

Você verá:
- ✅ Login funcionando
- ✅ Carrinho funcionando
- ✅ Pedidos sendo criados
- ✅ Admin com TODOS os botões clicáveis
- ✅ CRUD completo de produtos/categorias
- ✅ Gerenciamento de pedidos
- ✅ Gerenciamento de usuários
- ✅ Logout funcionando

**Sistema 100% operacional!** 🎉

---

## 📞 PRÓXIMOS PASSOS

1. Criar categorias (Hambúrgueres, Bebidas, etc.)
2. Criar produtos em cada categoria
3. Fazer pedidos de teste
4. Gerenciar status dos pedidos
5. Criar usuários de teste (Dono, Cliente)

---

**Última atualização:** 10/11/2025

