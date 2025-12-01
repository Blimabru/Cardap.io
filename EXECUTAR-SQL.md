# 🚀 GUIA RÁPIDO: Executar SQL no Supabase

## ✅ Arquivo Pronto

Um arquivo SQL combinado foi criado em:
```
supabase/migrations/TODAS_MIGRATIONS.sql
```

Este arquivo contém **TODAS** as migrations necessárias em um único arquivo.

---

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard
- Faça login na sua conta

### 2. Selecione seu Projeto
- Projeto: `cxisgfykkemcbqymtses`
- Ou procure pelo nome do seu projeto

### 3. Abra o SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Ou acesse diretamente: https://supabase.com/dashboard/project/cxisgfykkemcbqymtses/sql/new

### 4. Execute o SQL
- Abra o arquivo: `supabase/migrations/TODAS_MIGRATIONS.sql`
- **Selecione TODO o conteúdo** (Ctrl+A)
- **Copie** (Ctrl+C)
- **Cole** no SQL Editor do Supabase (Ctrl+V)
- Clique em **"Run"** (ou pressione **Ctrl+Enter**)

### 5. Verifique o Resultado
- Deve aparecer: `Success. No rows returned`
- Ou uma mensagem de sucesso
- Se houver erro, copie a mensagem e me informe

---

## ✅ O que será criado

Após executar o SQL, serão criados:

### Tabelas:
- ✅ `perfis` - Perfis de usuário (Admin, Dono, Cliente)
- ✅ `usuarios` - Dados dos usuários
- ✅ `categories` - Categorias de produtos
- ✅ `products` - Produtos do cardápio
- ✅ `pedidos` - Pedidos dos clientes
- ✅ `itens_pedido` - Itens de cada pedido

### Índices:
- ✅ Índices para performance em todas as tabelas

### Triggers:
- ✅ Triggers para atualizar `data_atualizacao` automaticamente

### Policies RLS:
- ✅ Row Level Security habilitado
- ✅ Policies de segurança configuradas

### Dados Iniciais:
- ✅ 3 perfis padrão inseridos (Administrador, Dono, Cliente)

---

## 🔍 Verificar se funcionou

Após executar, verifique:

1. **Tabelas criadas:**
   - Vá em: **Table Editor** (menu lateral)
   - Deve aparecer: `perfis`, `usuarios`, `categories`, `products`, `pedidos`, `itens_pedido`

2. **Perfis criados:**
   - Vá em: **Table Editor** > `perfis`
   - Deve ter 3 registros: Administrador, Dono, Cliente

---

## ⚠️ Se houver erro

Se aparecer algum erro:

1. **Copie a mensagem de erro completa**
2. **Me informe qual foi o erro**
3. **Verifique se:**
   - Você está no projeto correto
   - Você tem permissões de admin no projeto
   - A conexão com o banco está funcionando

---

## 🎯 Próximos Passos

Após executar o SQL com sucesso:

1. ✅ **Criar usuário admin** (veja `MIGRACAO-SUPABASE.md`)
2. ✅ **Testar o sistema**
3. ✅ **Começar a usar!**

---

## 📞 Suporte

Se precisar de ajuda, me informe:
- Qual erro apareceu (se houver)
- Em qual parte do SQL parou
- Screenshot (se possível)


