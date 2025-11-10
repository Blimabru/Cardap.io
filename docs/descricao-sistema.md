# Descrição do Sistema - Cardap.io

**Última atualização:** 10/11/2025  
**Versão:** 1.0  
**Status:** Em Desenvolvimento

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Objetivo do Sistema](#objetivo-do-sistema)
3. [Público-Alvo](#público-alvo)
4. [Funcionalidades Planejadas](#funcionalidades-planejadas)
5. [Escopo do Projeto](#escopo-do-projeto)
6. [Fora do Escopo](#fora-do-escopo)

---

## 🎯 Visão Geral

**Cardap.io** é uma plataforma digital de cardápio e gerenciamento de pedidos para restaurantes, lanchonetes e estabelecimentos de alimentação. O sistema permite que clientes visualizem o cardápio, façam pedidos e acompanhem o status em tempo real, enquanto os estabelecimentos gerenciam produtos, categorias, pedidos e usuários.

### Problema que Resolve
- Eliminação de cardápios físicos (higiene e custo)
- Agilidade no processo de pedidos
- Redução de erros na comunicação entre cliente e cozinha
- Controle melhor do estoque e vendas
- Experiência moderna e intuitiva para o cliente

---

## 🎯 Objetivo do Sistema

### Objetivo Principal
Criar uma solução completa de cardápio digital e gestão de pedidos que seja:
- **Intuitiva** para o cliente final
- **Eficiente** para a equipe do estabelecimento
- **Escalável** para múltiplos estabelecimentos
- **Robusta** e segura

### Objetivos Específicos
1. Digitalizar o cardápio de forma visual e atrativa
2. Facilitar o processo de pedidos para clientes
3. Centralizar a gestão de produtos e categorias
4. Permitir controle granular de permissões por perfil de usuário
5. Fornecer métricas e relatórios para tomada de decisão
6. Reduzir tempo de atendimento e erros operacionais

---

## 👥 Público-Alvo

### Usuários Finais (Clientes)
- **Perfil:** Pessoas que frequentam restaurantes e lanchonetes
- **Necessidades:**
  - Ver cardápio de forma clara e visualmente atraente
  - Buscar e filtrar produtos facilmente
  - Fazer pedidos sem fricção
  - Acompanhar status do pedido
  - Histórico de pedidos anteriores

### Usuários Operacionais

#### 1. Administrador
- **Perfil:** Dono ou gerente geral do estabelecimento
- **Necessidades:**
  - Controle total do sistema
  - Gerenciar usuários e permissões
  - Visualizar métricas e relatórios
  - Configurar o estabelecimento

#### 2. Gerente
- **Perfil:** Gerente de turno ou supervisor
- **Necessidades:**
  - Gerenciar produtos e categorias
  - Acompanhar pedidos em tempo real
  - Gerenciar equipe (limitado)
  - Visualizar relatórios básicos

#### 3. Garçom/Atendente
- **Perfil:** Profissional de atendimento
- **Necessidades:**
  - Visualizar pedidos da sua área
  - Atualizar status de pedidos
  - Ajudar clientes com o cardápio

#### 4. Cozinha
- **Perfil:** Equipe de cozinha/preparo
- **Necessidades:**
  - Receber pedidos em tempo real
  - Atualizar status de preparo
  - Visualizar fila de pedidos

---

## 🚀 Funcionalidades Planejadas

### Módulo de Cardápio (Cliente)
- [x] Visualizar produtos com foto, nome, preço e avaliação
- [ ] Ver detalhes completos do produto
- [ ] Buscar produtos por nome
- [ ] Filtrar por categoria
- [ ] Filtrar por preço
- [ ] Ordenar por diferentes critérios
- [ ] Favoritar produtos
- [ ] Ver produtos recomendados

### Módulo de Carrinho
- [ ] Adicionar produtos ao carrinho
- [ ] Alterar quantidade
- [ ] Remover produtos
- [ ] Ver subtotal e total
- [ ] Adicionar observações ao pedido
- [ ] Selecionar endereço de entrega (se delivery)
- [ ] Escolher forma de pagamento

### Módulo de Pedidos (Cliente)
- [ ] Finalizar pedido
- [ ] Acompanhar status em tempo real
- [ ] Receber notificações de atualização
- [ ] Ver histórico de pedidos
- [ ] Repetir pedido anterior
- [ ] Cancelar pedido (em condições específicas)
- [ ] Avaliar pedido/produto

### Módulo de Autenticação
- [ ] Login com email/senha
- [ ] Registro de novo usuário
- [ ] Recuperação de senha
- [ ] Login social (Google/Facebook)
- [ ] Logout
- [ ] Alterar senha

### Módulo de Perfil (Cliente)
- [ ] Editar dados pessoais
- [ ] Gerenciar endereços
- [ ] Visualizar histórico de pedidos
- [ ] Gerenciar favoritos
- [ ] Configurações de notificação

### Módulo Administrativo - Produtos
- [ ] Listar todos os produtos
- [ ] Criar novo produto
- [ ] Editar produto existente
- [ ] Deletar produto
- [ ] Upload de múltiplas imagens
- [ ] Ativar/desativar produto
- [ ] Controlar estoque
- [ ] Definir variações (tamanhos, sabores, etc.)

### Módulo Administrativo - Categorias
- [ ] Listar categorias
- [ ] Criar categoria
- [ ] Editar categoria
- [ ] Deletar categoria (se não tiver produtos)
- [ ] Ordenar categorias
- [ ] Ativar/desativar categoria

### Módulo Administrativo - Pedidos
- [ ] Visualizar todos os pedidos
- [ ] Filtrar pedidos por status
- [ ] Filtrar por data
- [ ] Ver detalhes completos do pedido
- [ ] Atualizar status manualmente
- [ ] Cancelar pedido com justificativa
- [ ] Imprimir/exportar pedido

### Módulo Administrativo - Usuários
- [ ] Listar todos os usuários
- [ ] Criar novo usuário/funcionário
- [ ] Editar usuário
- [ ] Desativar usuário
- [ ] Definir perfil e permissões
- [ ] Resetar senha de usuário
- [ ] Ver log de atividades do usuário

### Módulo Administrativo - Dashboard
- [ ] Métricas principais (vendas, pedidos, etc.)
- [ ] Gráficos de vendas
- [ ] Produtos mais vendidos
- [ ] Horários de pico
- [ ] Avaliação média
- [ ] Receita do período

### Módulo Administrativo - Relatórios
- [ ] Relatório de vendas
- [ ] Relatório de produtos
- [ ] Relatório de clientes
- [ ] Relatório financeiro
- [ ] Exportar relatórios (PDF/Excel)

### Módulo de Notificações
- [ ] Notificação push para clientes
- [ ] Notificação push para equipe
- [ ] Notificações em tempo real
- [ ] Configuração de preferências

### Módulo de Configurações
- [ ] Dados do estabelecimento
- [ ] Horário de funcionamento
- [ ] Formas de pagamento
- [ ] Taxas (entrega, serviço)
- [ ] Raio de entrega
- [ ] Configurações de notificação
- [ ] Configurações de email

---

## 📦 Escopo do Projeto

### Fase 1 - MVP (Produto Mínimo Viável)
**Prazo:** 4 semanas

#### Entregáveis
1. **Backend:**
   - API completa de Produtos (CRUD)
   - API completa de Categorias (CRUD)
   - Autenticação JWT
   - Sistema básico de permissões
   - Migrations e seeds

2. **Frontend:**
   - Tela de login
   - Tela home com cardápio
   - Tela de detalhes do produto
   - Carrinho de compras básico
   - Finalização de pedido simples

3. **Documentação:**
   - Todos os 20 documentos obrigatórios
   - Código 100% em português
   - Comentários e documentação inline

4. **Segurança:**
   - Variáveis de ambiente
   - Validações completas
   - RLS básico
   - Tratamento de erros

### Fase 2 - Gestão Completa
**Prazo:** 4 semanas após MVP

#### Entregáveis
1. Área administrativa completa
2. Gestão de pedidos em tempo real
3. Sistema completo de permissões
4. Dashboard com métricas
5. Upload de imagens

### Fase 3 - Experiência Avançada
**Prazo:** 4 semanas após Fase 2

#### Entregáveis
1. Notificações push
2. Sistema de avaliações
3. Produtos favoritos
4. Recomendações
5. Histórico completo
6. Relatórios avançados

### Fase 4 - Multi-estabelecimento
**Prazo:** 6 semanas após Fase 3

#### Entregáveis
1. Suporte a múltiplos estabelecimentos
2. Gestão centralizada
3. Personalização por estabelecimento
4. Analytics avançado

---

## 🚫 Fora do Escopo

### Versão 1.0 NÃO incluirá:
- ❌ Sistema de delivery próprio (usar integração com Uber Eats, iFood, etc.)
- ❌ Gateway de pagamento integrado (pagamento no local ou entrega)
- ❌ Sistema de fidelidade/programa de pontos
- ❌ Chat/mensagens entre cliente e estabelecimento
- ❌ Sistema de reservas de mesa
- ❌ Cardápio em múltiplos idiomas
- ❌ Modo offline completo
- ❌ Integração com ERP externo
- ❌ Aplicativo para tablet/desktop (apenas mobile)
- ❌ Sistema de impressão de comanda automático

### Pode ser considerado para Versão 2.0:
- Sistema de fidelidade
- Programa de cupons e promoções
- Chat com suporte
- Reserva de mesas
- Pagamento online integrado
- Modo offline parcial

---

## 🎨 Diferenciais do Cardap.io

1. **Foco em UX:** Interface moderna e intuitiva
2. **Personalização:** Visual adaptável para cada estabelecimento
3. **Permissões Granulares:** Controle fino de acesso por perfil
4. **Real-time:** Atualizações instantâneas de pedidos
5. **Simplicidade:** Fácil de usar tanto para cliente quanto equipe
6. **Escalabilidade:** Preparado para crescer com o negócio
7. **Documentação:** Código bem documentado e mantível

---

## 📊 Métricas de Sucesso

### Para Clientes
- Tempo médio para fazer pedido < 3 minutos
- Taxa de conclusão de pedido > 85%
- Avaliação média do app > 4.5 estrelas

### Para Estabelecimentos
- Redução de 30% no tempo de atendimento
- Redução de 50% em erros de pedido
- Aumento de 20% nas vendas (por facilitar pedidos)
- 100% de rastreabilidade de pedidos

---

**Histórico de Mudanças Recentes:**
- 10/11/2025 - Documento criado com descrição completa do sistema


