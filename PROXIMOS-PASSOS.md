# 🎯 Próximos Passos Após Migração

## ✅ Status Atual
- ✅ Migrations SQL executadas
- ✅ Tabelas criadas no Supabase
- ✅ RLS (Row Level Security) configurado
- ✅ Perfis padrão criados (Administrador, Dono, Cliente)

---

## 📋 Passo 1: Criar Usuário Administrador

Você precisa criar um usuário admin para poder gerenciar o sistema.

### Opção A: Via Supabase Dashboard (Recomendado) ⭐

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/cxisgfykkemcbqymtses/auth/users

2. **Criar novo usuário:**
   - Clique em **"Add user"** > **"Create new user"**
   - Preencha:
     - **Email:** `admin@cardapio.com`
     - **Password:** `admin123` (ou escolha uma senha forte)
     - **Auto Confirm User:** ✅ (MARQUE esta opção!)
   - Clique em **"Create user"**

3. **Copiar o User UID:**
   - Após criar, você verá o usuário na lista
   - **Copie o UID** (é um UUID longo, tipo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

4. **Vincular ao perfil Administrador:**
   - Vá em **SQL Editor**
   - Execute o SQL abaixo, **substituindo `SEU_USER_UID_AQUI`** pelo UID copiado:

```sql
-- Substitua 'SEU_USER_UID_AQUI' pelo UID do usuário criado
INSERT INTO usuarios (
  id,
  nome_completo,
  email,
  id_perfil,
  ativo,
  email_verificado
)
SELECT 
  'SEU_USER_UID_AQUI',  -- COLE O UID AQUI
  'Administrador do Sistema',
  'admin@cardapio.com',
  id,
  true,
  true
FROM perfis
WHERE nome_perfil = 'Administrador';
```

### Opção B: Via App (Depois atualizar para Admin)

1. **Abra o app** e vá em "Cadastre-se"
2. **Registre** com email e senha
3. **No SQL Editor**, execute (substitua o UID):

```sql
-- Primeiro, encontre o UID do usuário criado
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- Depois, atualize para Admin (substitua o UID)
UPDATE usuarios
SET id_perfil = (SELECT id FROM perfis WHERE nome_perfil = 'Administrador')
WHERE id = 'SEU_USER_UID_AQUI';
```

---

## 📋 Passo 2: Verificar se Tudo Está Funcionando

### 2.1 Verificar Tabelas

1. Acesse: **Table Editor** no Supabase Dashboard
2. Verifique se existem estas tabelas:
   - ✅ `perfis` (deve ter 3 registros)
   - ✅ `usuarios` (deve ter pelo menos 1 - o admin)
   - ✅ `categories` (pode estar vazia)
   - ✅ `products` (pode estar vazia)
   - ✅ `pedidos` (pode estar vazia)
   - ✅ `itens_pedido` (pode estar vazia)

### 2.2 Verificar Perfis

1. Vá em **Table Editor** > `perfis`
2. Deve ter 3 perfis:
   - ✅ Administrador
   - ✅ Dono
   - ✅ Cliente

---

## 📋 Passo 3: Testar o Sistema

### 3.1 Iniciar o App

```bash
cd "C:\Users\Jotta\Desktop\Cardapio\cardapiozinho\Cardap.io"
npm start
# ou
npx expo start
```

### 3.2 Testar Login

1. Abra o app no emulador/dispositivo
2. Tente fazer login com:
   - **Email:** `admin@cardapio.com`
   - **Senha:** `admin123` (ou a que você escolheu)

### 3.3 Testar Funcionalidades

Após fazer login, teste:

- ✅ **Visualizar produtos** (pode estar vazio, é normal)
- ✅ **Visualizar categorias** (pode estar vazio, é normal)
- ✅ **Acessar área admin** (se for admin, deve aparecer)
- ✅ **Criar categoria** (Admin/Dono)
- ✅ **Criar produto** (Admin/Dono)
- ✅ **Adicionar ao carrinho**
- ✅ **Fazer pedido**

---

## 📋 Passo 4: Criar Dados Iniciais (Opcional)

Se quiser popular o sistema com dados de exemplo, execute no SQL Editor:

```sql
-- 1. Criar categorias de exemplo
INSERT INTO categories (name) VALUES
  ('Pizzas'),
  ('Bebidas'),
  ('Sobremesas'),
  ('Lanches'),
  ('Saladas')
ON CONFLICT DO NOTHING;

-- 2. Criar produtos de exemplo
INSERT INTO products (name, description, price, imageUrl, categoryId)
SELECT 
  'Pizza Margherita',
  'Pizza clássica com molho de tomate, mussarela e manjericão',
  35.90,
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
  id
FROM categories WHERE name = 'Pizzas'
LIMIT 1;

INSERT INTO products (name, description, price, imageUrl, categoryId)
SELECT 
  'Coca-Cola 350ml',
  'Refrigerante gelado',
  5.50,
  'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
  id
FROM categories WHERE name = 'Bebidas'
LIMIT 1;

INSERT INTO products (name, description, price, imageUrl, categoryId)
SELECT 
  'Brownie com Sorvete',
  'Brownie quentinho com sorvete de creme',
  12.90,
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
  id
FROM categories WHERE name = 'Sobremesas'
LIMIT 1;
```

---

## 📋 Passo 5: Limpeza (Opcional)

Se quiser remover a pasta do backend antigo:

```powershell
cd "C:\Users\Jotta\Desktop\Cardapio\cardapiozinho\Cardap.io"
Remove-Item -Path "meu-cardapio-api" -Recurse -Force
```

**⚠️ Atenção:** Só faça isso se tiver certeza de que não precisa mais do backend antigo.

---

## 🐛 Problemas Comuns

### Erro: "Usuário não encontrado"
- **Solução:** Verifique se o UID está correto no SQL
- **Solução:** Verifique se o usuário foi criado no Supabase Auth

### Erro: "Perfil não encontrado"
- **Solução:** Execute novamente a migration `001_create_schema.sql` para criar os perfis

### Erro: "RLS policy violation"
- **Solução:** Verifique se a migration `002_create_rls_policies.sql` foi executada
- **Solução:** Verifique se o usuário está autenticado corretamente

### App não conecta ao Supabase
- **Solução:** Verifique se as credenciais em `constants/api.ts` estão corretas
- **Solução:** Verifique se o Supabase está online

---

## ✅ Checklist Final

Antes de considerar tudo pronto, verifique:

- [ ] Migrations executadas com sucesso
- [ ] Usuário admin criado e vinculado ao perfil Administrador
- [ ] Login funcionando no app
- [ ] Área admin acessível (se for admin)
- [ ] Categorias podem ser criadas (Admin/Dono)
- [ ] Produtos podem ser criados (Admin/Dono)
- [ ] Produtos aparecem na tela inicial
- [ ] Carrinho funciona
- [ ] Pedidos podem ser criados

---

## 🎉 Pronto!

Se tudo estiver funcionando, seu sistema está migrado e pronto para uso!

**Dúvidas?** Me informe qual erro apareceu ou qual funcionalidade não está funcionando.


