# Teste de Pedidos de Mesa (QR Code)

## Objetivo

Garantir que pedidos possam ser criados via QR code sem necessidade de autenticação do cliente.

## Pré-requisitos

1. Execute a migration `010_fix_rls_pedidos_final.sql` no Supabase SQL Editor
2. Execute a migration `011_verificar_policies_pedidos.sql` (opcional, para verificar)

## Como Funciona

### 1. Fluxo de Pedido de Mesa

1. Cliente escaneia QR code da mesa
2. Sistema valida o QR code e carrega o cardápio
3. Cliente adiciona produtos ao carrinho
4. Cliente finaliza pedido (sem login)
5. Sistema cria pedido com:
   - `id_mesa`: ID da mesa escaneada
   - `id_usuario`: NULL (pedido anônimo)
   - `status`: 'pendente'
   - `status_pagamento`: 'pendente'

### 2. Policies RLS

A policy "Permitir criação de pedidos" permite:
- ✅ Pedidos de usuários autenticados (`id_usuario = auth.uid()`)
- ✅ Pedidos de mesa anônimos (`id_mesa IS NOT NULL`)

### 3. Verificação

Para verificar se as policies estão corretas, execute no Supabase SQL Editor:

```sql
-- Verificar policies de INSERT
SELECT 
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos' AND cmd = 'INSERT';
```

Deve retornar apenas UMA policy: "Permitir criação de pedidos"

## Teste Manual

1. **Acesse a aplicação sem fazer login**
2. **Escaneie um QR code de mesa** (ou acesse `/mesa/[qrCode]`)
3. **Adicione produtos ao carrinho**
4. **Clique em "Finalizar Pedido"**
5. **Verifique no console do navegador:**
   - Deve aparecer: `📝 Criando pedido de mesa (anon)`
   - Deve aparecer: `✅ Pedido criado com sucesso`
6. **Verifique no Supabase Dashboard:**
   - Tabela `pedidos` deve ter um novo registro
   - Campo `id_mesa` deve estar preenchido
   - Campo `id_usuario` deve ser NULL
   - Tabela `itens_pedido` deve ter os itens do pedido

## Troubleshooting

### Erro: "new row violates row-level security policy"

**Causa:** Policies RLS não estão configuradas corretamente.

**Solução:**
1. Execute a migration `010_fix_rls_pedidos_final.sql`
2. Execute a migration `011_verificar_policies_pedidos.sql`
3. Verifique se há apenas UMA policy de INSERT na tabela `pedidos`

### Erro: "Usuário não autenticado"

**Causa:** Código está tentando obter usuário quando não deveria.

**Solução:** Verifique se `dados.id_mesa` está sendo passado corretamente.

### Pedido criado mas itens não aparecem

**Causa:** Policy de `itens_pedido` não permite inserção.

**Solução:** Execute a migration `010_fix_rls_pedidos_final.sql` que corrige ambas as policies.

## Logs de Debug

O código agora inclui logs para facilitar o debug:

- `📝 Criando pedido de mesa (anon)`: Quando tenta criar pedido sem autenticação
- `✅ Pedido criado com sucesso`: Quando o pedido é criado
- `❌ Erro ao criar pedido`: Quando há erro (inclui detalhes completos)

## Arquivos Relacionados

- `supabase/migrations/010_fix_rls_pedidos_final.sql`: Migration principal
- `supabase/migrations/011_verificar_policies_pedidos.sql`: Migration de verificação
- `services/pedidos.service.ts`: Service que cria pedidos
- `app/mesa/[qrCode].tsx`: Tela de cardápio via QR code

