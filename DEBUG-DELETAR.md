# 🐛 DEBUG - Botão de Deletar Produto

**Data:** 10/11/2025

---

## 🔍 LOGS DE DEBUG ADICIONADOS

Acabei de adicionar logs detalhados no botão de deletar. Agora você pode diagnosticar o problema.

---

## 🧪 TESTE PASSO A PASSO:

### 1. **Abra o Console do Expo**
Olhe o terminal onde o Expo está rodando

### 2. **Clique no Botão de Lixeira**
Na tela "Gerenciar Produtos", clique no ícone vermelho (lixeira) de qualquer produto

### 3. **Verifique os Logs**

#### ✅ Se o botão estiver RESPONDENDO ao clique, você verá:
```
🗑️ Botão de deletar clicado para produto: [NOME] ID: [ID]
```

Se vir isso → **Botão funciona!** Continue para próximo passo.

Se NÃO vir → **Botão não está respondendo**

---

#### ✅ Se o MODAL DE CONFIRMAÇÃO aparecer:
Você deve ver um Alert perguntando: "Deseja realmente deletar [nome]?"

**Clique em "Deletar"**

---

#### ✅ Depois de confirmar, você verá:
```
🔄 Iniciando deleção do produto ID: [ID]
📡 Chamando API para deletar produto ID: [ID]
🔐 Token sendo enviado: eyJhbGciOiJIUzI1NiIs...
```

---

#### ❌ Se der ERRO 401:
```
❌ Erro na API ao deletar: Error: Erro 401
```

**CAUSA:** Token JWT inválido (problema de JWT_SECRET)

---

## 🚨 SE DER ERRO 401:

### O problema NÃO é o botão. É autenticação!

**SOLUÇÃO COMPLETA:**

#### 1️⃣ **PARAR O BACKEND**
Na janela do backend, pressione `Ctrl+C`

#### 2️⃣ **VERIFICAR .env**
```bash
cd meu-cardapio-api
Get-Content .env
```

Deve conter:
```
JWT_SECRET=cardapio_jwt_secret_2025_super_seguro_mudar_em_producao
```

#### 3️⃣ **REINICIAR BACKEND**
```bash
npm run start:dev
```

Aguarde compilar completamente e ver:
```
🚀 Servidor rodando em: http://localhost:3000
```

#### 4️⃣ **LIMPAR SESSÃO NO APP**

**No App:**
1. Ir para tab "Admin"
2. Clicar no **ícone vermelho (logout)** no topo direito
3. Confirmar saída
4. Fazer LOGIN novamente:
   - Email: `admin@cardapio.com`
   - Senha: `admin123`

#### 5️⃣ **TESTAR NOVAMENTE**
Agora o botão de deletar deve funcionar!

---

## 📋 DIAGNÓSTICO RÁPIDO

### Quando você clicar no botão, verifique:

**Console mostra:**
```
🗑️ Botão de deletar clicado...
```
→ ✅ Botão funciona

**Alert de confirmação aparece**
→ ✅ Interface funciona

**Após confirmar, console mostra:**
```
🔄 Iniciando deleção...
📡 Chamando API...
🔐 Token sendo enviado...
```
→ ✅ Request está sendo enviado

**Se aparecer:**
```
❌ Erro na API ao deletar: Error: Erro 401
```
→ ❌ Problema de autenticação (JWT)

**Se aparecer:**
```
✅ API retornou sucesso
✅ Produto deletado com sucesso!
```
→ ✅ FUNCIONOU PERFEITAMENTE!

---

## 🎯 AÇÕES IMEDIATAS:

1. **Clique no botão de lixeira AGORA**
2. **Olhe o console do Expo**
3. **Me diga o que aparece** no console

Baseado nos logs, vou identificar exatamente onde está o problema!

---

## 💡 SUSPEITA PRINCIPAL:

Como você está vendo erro 401 em PUT e POST, o problema provavelmente é:
- ❌ Backend não foi reiniciado após corrigir JWT_SECRET
- ❌ Token antigo ainda em uso (gerado com secret errado)

**Reinicie backend + Faça logout/login no app!**

---

**TESTE E ME MOSTRE OS LOGS DO CONSOLE!** 🔍

