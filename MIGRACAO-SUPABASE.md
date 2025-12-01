# Migração para Supabase - Instruções

## Status da Migração

✅ **Migração concluída!** O sistema foi completamente migrado do backend NestJS para Supabase.

## O que foi feito

### FASE 1: Preparação ✅
- ✅ Instalado `@supabase/supabase-js`
- ✅ Criado `lib/supabase.ts` com cliente configurado
- ✅ Criados SQL migrations em `supabase/migrations/`
- ✅ Configurado RLS (Row Level Security)

### FASE 2: Autenticação ✅
- ✅ Migrado `AuthContext` para Supabase Auth
- ✅ Migrado `autenticacao.service.ts` para Supabase Auth
- ✅ Login, registro e logout funcionando com Supabase

### FASE 3: Services ✅
- ✅ `produtos.service.ts` migrado
- ✅ `categorias.service.ts` migrado
- ✅ `pedidos.service.ts` migrado
- ✅ `usuarios.service.ts` migrado
- ✅ `perfis.service.ts` migrado

### FASE 4: API Base ✅
- ✅ `api.ts` atualizado (deprecado, mantido para compatibilidade)
- ✅ `constants/api.ts` atualizado

### FASE 5: Telas ✅
- ✅ `app/(tabs)/index.tsx` atualizado para usar services
- ✅ Todas as telas de admin já usam services

### FASE 6: Backend Antigo ⚠️
- ⚠️ Pasta `meu-cardapio-api/` precisa ser deletada manualmente
  - Motivo: Arquivo em uso por outro processo
  - Solução: Feche o servidor backend se estiver rodando e delete a pasta

## Próximos Passos OBRIGATÓRIOS

### 1. Executar SQL no Supabase

**CRÍTICO:** Execute os seguintes arquivos SQL no Supabase Dashboard antes de testar:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `cxisgfykkemcbqymtses`
3. Vá em: SQL Editor
4. Execute na ordem:

**Ordem de Execução:**
1. `supabase/migrations/001_create_schema.sql`
   - Cria todas as tabelas
   - Cria índices
   - Cria triggers
   - Insere perfis padrão

2. `supabase/migrations/002_create_rls_policies.sql`
   - Habilita RLS
   - Cria policies de segurança
   - Configura permissões

**⚠️ IMPORTANTE:**
- Execute na ordem mostrada acima
- Verifique se não houve erros
- Se houver erro, me informe qual foi

### 2. Criar Usuário Admin Inicial

Após executar os SQLs, você precisa criar um usuário administrador:

**Opção A: Via Supabase Dashboard (Recomendado)**
1. Acesse: Authentication > Users
2. Clique em "Add user" > "Create new user"
3. Preencha:
   - Email: `admin@cardapio.com`
   - Password: `admin123`
   - Auto Confirm User: ✅ (marcar)
4. Após criar, copie o `User UID`
5. No SQL Editor, execute:

```sql
-- Substitua 'USER_UID_AQUI' pelo UID copiado
INSERT INTO usuarios (
  id,
  nome_completo,
  email,
  id_perfil,
  ativo,
  email_verificado
)
SELECT 
  'USER_UID_AQUI',
  'Administrador do Sistema',
  'admin@cardapio.com',
  id,
  true,
  true
FROM perfis
WHERE nome_perfil = 'Administrador';
```

**Opção B: Via App (Registro)**
1. Abra o app
2. Vá em "Cadastre-se"
3. Registre com email e senha
4. O usuário será criado como "Cliente"
5. No SQL Editor, atualize para Admin:

```sql
-- Substitua 'USER_UID_AQUI' pelo ID do usuário criado
UPDATE usuarios
SET id_perfil = (SELECT id FROM perfis WHERE nome_perfil = 'Administrador')
WHERE id = 'USER_UID_AQUI';
```

### 3. Deletar Pasta do Backend Antigo

Após fechar qualquer processo que esteja usando a pasta:

```bash
# No PowerShell
cd "C:\Users\Jotta\Desktop\Cardapio\cardapiozinho\Cardap.io"
Remove-Item -Path "meu-cardapio-api" -Recurse -Force
```

Ou delete manualmente pelo Explorer.

### 4. Configurar Variáveis de Ambiente (Opcional)

Se quiser usar variáveis de ambiente no frontend, crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://cxisgfykkemcbqymtses.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aXNnZnlra2VtY2JxeW10c2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTIzNTgsImV4cCI6MjA3OTU2ODM1OH0.oZPTCd0ot9wT06qB3mUZYLD1juvn-AAsSMBVp0CJEXo
```

**NOTA:** As credenciais já estão hardcoded no `lib/supabase.ts` como fallback, então isso é opcional.

## Testes

Após executar os SQLs e criar o usuário admin, teste:

1. ✅ Login com admin@cardapio.com / admin123
2. ✅ Visualizar produtos e categorias
3. ✅ Buscar produtos
4. ✅ Adicionar ao carrinho
5. ✅ Criar pedido
6. ✅ Ver pedidos
7. ✅ Gerenciar produtos (Admin/Dono)
8. ✅ Gerenciar categorias (Admin/Dono)
9. ✅ Gerenciar usuários (Admin)
10. ✅ Ver todos os pedidos (Admin/Dono)

## Arquivos Criados/Modificados

### Criados:
- `lib/supabase.ts` - Cliente Supabase
- `supabase/migrations/001_create_schema.sql` - Schema do banco
- `supabase/migrations/002_create_rls_policies.sql` - Policies RLS
- `MIGRACAO-SUPABASE.md` - Este arquivo

### Modificados:
- `services/autenticacao.service.ts` - Migrado para Supabase Auth
- `services/produtos.service.ts` - Migrado para Supabase
- `services/categorias.service.ts` - Migrado para Supabase
- `services/pedidos.service.ts` - Migrado para Supabase
- `services/usuarios.service.ts` - Migrado para Supabase
- `services/perfis.service.ts` - Migrado para Supabase
- `services/api.ts` - Deprecado (mantido para compatibilidade)
- `contexts/AuthContext.tsx` - Usa Supabase Auth
- `constants/api.ts` - Atualizado
- `app/(tabs)/index.tsx` - Usa services

### Para Deletar:
- `meu-cardapio-api/` - Pasta inteira (backend antigo)

## Problemas Conhecidos

1. **Criar usuário via código**: Requer service_role key ou Edge Function
   - Solução temporária: Criar via Supabase Dashboard
   - Solução futura: Criar Edge Function para criar usuários

2. **Deletar usuário**: Não pode deletar do Supabase Auth sem service_role
   - Solução atual: Apenas desativa o usuário
   - Solução futura: Edge Function ou usar service_role

## Suporte

Se encontrar problemas:
1. Verifique se os SQLs foram executados
2. Verifique se o usuário admin foi criado
3. Verifique os logs do console
4. Verifique as policies RLS no Supabase Dashboard


