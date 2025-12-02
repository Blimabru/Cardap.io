/**
 * ============================================================================
 * PEDIDOS.SERVICE.TS - SERVIÇO DE GERENCIAMENTO DE PEDIDOS
 * ============================================================================
 * 
 * Este serviço gerencia todas as operações relacionadas a pedidos no sistema.
 * 
 * RESPONSABILIDADES:
 * - Criar novos pedidos (com/sem mesa, autenticado/anônimo)
 * - Listar pedidos (do usuário ou todos para admin)
 * - Atualizar status de pedidos
 * - Cancelar pedidos
 * - Buscar pedidos por ID
 * - Obter estatísticas de pedidos
 * - Formatar dados do Supabase para tipos TypeScript
 * 
 * FUNCIONALIDADES PRINCIPAIS:
 * 1. criarPedido: Cria pedido com transação (pedido + itens)
 * 2. listarMeusPedidos: Lista pedidos do usuário autenticado
 * 3. listarTodosPedidos: Lista todos os pedidos (apenas admin/dono)
 * 4. atualizarStatusPedido: Atualiza status (pendente, em preparo, pronto, etc)
 * 5. cancelarPedido: Cancela um pedido
 * 6. buscarPedidoPorId: Busca pedido específico por ID
 * 7. obterEstatisticas: Retorna estatísticas de pedidos
 * 
 * DIFERENÇA ENTRE SUPABASE E SUPABASEANON:
 * - supabase: Cliente autenticado (requer login)
 * - supabaseAnon: Cliente anônimo (para pedidos de mesa via QR code)
 * 
 * RLS (Row Level Security):
 * - Políticas de segurança do Supabase controlam acesso
 * - Usuários só veem seus próprios pedidos
 * - Admin/Dono veem todos os pedidos
 * - Anônimos podem criar pedidos de mesa
 */

// Importação do tipo SupabaseClient do Supabase
import { SupabaseClient } from '@supabase/supabase-js';
// Importação dos clientes Supabase (autenticado e anônimo)
import { supabase, supabaseAnon } from '../lib/supabase';
// Importação de tipos TypeScript do projeto
import { Pedido, CriarPedidoDto, StatusPedido, EstatisticasPedidos, ItemPedido, Usuario, Produto } from '../types';

/**
 * ============================================================================
 * FUNÇÃO AUXILIAR: formatarPedido
 * ============================================================================
 * 
 * Converte dados brutos do Supabase para o tipo Pedido do TypeScript.
 * 
 * Esta função é necessária porque:
 * - Supabase retorna dados em formato diferente
 * - Preços podem vir como string ou number
 * - Relacionamentos (mesa, usuario, itens) precisam ser formatados
 * - Valores nulos precisam ser tratados
 * 
 * @param data - Dados brutos retornados do Supabase
 * @returns Pedido - Objeto formatado no tipo Pedido
 */
const formatarPedido = (data: any): Pedido => {
  return {
    id: data.id,
    numero_pedido: data.numero_pedido,
    status: data.status as StatusPedido,
    tipo_pedido: data.tipo_pedido as any,
    subtotal: typeof data.subtotal === 'string' ? parseFloat(data.subtotal) : data.subtotal,
    taxa_entrega: typeof data.taxa_entrega === 'string' ? parseFloat(data.taxa_entrega) : data.taxa_entrega,
    taxa_servico: typeof data.taxa_servico === 'string' ? parseFloat(data.taxa_servico) : data.taxa_servico,
    total: typeof data.total === 'string' ? parseFloat(data.total) : data.total,
    observacoes: data.observacoes || undefined,
    endereco_entrega: data.endereco_entrega || undefined,
    id_mesa: data.id_mesa || undefined,
    status_pagamento: data.status_pagamento || undefined,
    mesa: data.mesa ? {
      id: data.mesa.id,
      numero: data.mesa.numero,
      qr_code: data.mesa.qr_code,
      status: data.mesa.status,
      capacidade: data.mesa.capacidade,
      observacoes: data.mesa.observacoes || undefined,
      data_criacao: data.mesa.data_criacao,
      data_atualizacao: data.mesa.data_atualizacao,
    } : undefined,
    usuario: data.usuario ? {
      id: data.usuario.id,
      nome_completo: data.usuario.nome_completo,
      email: data.usuario.email,
      telefone: data.usuario.telefone || undefined,
      foto_perfil_url: data.usuario.foto_perfil_url || undefined,
      ativo: data.usuario.ativo,
      email_verificado: data.usuario.email_verificado,
      perfil: data.usuario.perfil ? {
        id: data.usuario.perfil.id,
        nome_perfil: data.usuario.perfil.nome_perfil as 'Administrador' | 'Dono' | 'Cliente',
        descricao: data.usuario.perfil.descricao || '',
        permissoes: data.usuario.perfil.permissoes,
        ativo: data.usuario.perfil.ativo,
        data_criacao: data.usuario.perfil.data_criacao,
        data_atualizacao: data.usuario.perfil.data_atualizacao,
      } : {} as any,
      data_criacao: data.usuario.data_criacao,
      data_atualizacao: data.usuario.data_atualizacao,
    } : undefined,
    itens: (data.itens || []).map((item: any): ItemPedido => ({
      id: item.id,
      quantidade: item.quantidade,
      preco_unitario: typeof item.preco_unitario === 'string' ? parseFloat(item.preco_unitario) : item.preco_unitario,
      subtotal: typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal,
      observacoes: item.observacoes || undefined,
      produto: item.produto ? {
        id: item.produto.id,
        name: item.produto.name,
        description: item.produto.description || undefined,
        price: typeof item.produto.price === 'string' ? parseFloat(item.produto.price) : item.produto.price,
        imageUrl: item.produto.imageUrl,
        rating: typeof item.produto.rating === 'string' ? parseFloat(item.produto.rating) : item.produto.rating,
        category: item.produto.category ? {
          id: item.produto.category.id,
          name: item.produto.category.name,
        } : { id: '', name: '' },
      } : {} as Produto,
    })),
    data_criacao: data.data_criacao,
    data_atualizacao: data.data_atualizacao,
  };
};

/**
 * Cria novo pedido com transação
 */
export const criarPedido = async (dados: CriarPedidoDto): Promise<Pedido> => {
  console.log('🚀 INÍCIO: Criar pedido', JSON.stringify({
    tem_id_mesa: !!dados.id_mesa,
    id_mesa: dados.id_mesa,
    quantidade_itens: dados.itens.length,
    tipo_pedido: dados.tipo_pedido,
  }, null, 2));

  // 1. Obter usuário autenticado (se não for pedido por mesa)
  let userId: string | null = null;
  
  if (!dados.id_mesa) {
    // Pedido normal requer autenticação
    console.log('🔐 Verificando autenticação para pedido normal...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erro ao verificar usuário:', JSON.stringify(userError, null, 2));
    }
    
    if (!user) {
      throw new Error('Usuário não autenticado. Para fazer pedidos sem login, você precisa estar em uma mesa (via QR code).');
    }
    userId = user.id;
    console.log('✅ Usuário autenticado:', JSON.stringify({ user_id: userId }, null, 2));
  } else {
    // Para pedidos de mesa, verificar se há sessão (opcional)
    console.log('🔍 Verificando sessão para pedido de mesa...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('⚠️ Erro ao verificar sessão (pode ser normal para anon):', JSON.stringify(sessionError, null, 2));
    }
    
    if (session) {
      // Se há sessão, usar o usuário da sessão (opcional para pedidos de mesa)
      console.log('📝 Sessão encontrada, verificando usuário...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.warn('⚠️ Erro ao obter usuário da sessão:', JSON.stringify(userError, null, 2));
      }
      
      if (user) {
        userId = user.id; // Opcional: pode associar pedido de mesa ao usuário se estiver logado
        console.log('✅ Usuário da sessão será associado ao pedido:', JSON.stringify({ user_id: userId }, null, 2));
      }
    } else {
      console.log('ℹ️ Nenhuma sessão encontrada - pedido será anônimo');
    }
    // Se não há sessão, userId fica null (pedido anônimo permitido)
  }
  
  // Validação: Pedido deve ter id_usuario OU id_mesa
  if (!userId && !dados.id_mesa) {
    throw new Error('Pedido inválido: é necessário estar autenticado ou fazer pedido via mesa (QR code).');
  }

  // 2. Buscar produtos para calcular preços
  // Para pedidos de mesa anônimos, usar client anon também para buscar produtos
  const clientParaProdutos = (dados.id_mesa && !userId) ? supabaseAnon : supabase;
  const produtosIds = dados.itens.map(item => item.id_produto);
  
  console.log('🛒 Buscando produtos:', JSON.stringify({
    quantidade_produtos: produtosIds.length,
    produtos_ids: produtosIds,
    cliente: clientParaProdutos === supabaseAnon ? 'anon' : 'authenticated',
  }, null, 2));
  
  const { data: produtos, error: produtosError } = await clientParaProdutos
    .from('products')
    .select('id, price')
    .in('id', produtosIds);

  if (produtosError || !produtos) {
    // Serializar erro corretamente
    const erroSerializado = JSON.stringify({
      error: produtosError ? {
        message: produtosError.message,
        code: produtosError.code,
        details: produtosError.details,
        hint: produtosError.hint,
      } : null,
      produtos_ids: produtosIds,
      quantidade_produtos: produtosIds.length,
    }, null, 2);
    
    console.error('❌ Erro ao buscar produtos:', erroSerializado);
    throw new Error(produtosError?.message || 'Erro ao buscar produtos');
  }

  // 3. Calcular totais
  console.log('💰 Calculando totais do pedido...');
  let subtotal = 0;
  const itensComPreco = dados.itens.map(item => {
    const produto = produtos.find(p => p.id === item.id_produto);
    if (!produto) {
      throw new Error(`Produto ${item.id_produto} não encontrado`);
    }
    const precoUnitario = typeof produto.price === 'string' ? parseFloat(produto.price) : produto.price;
    const itemSubtotal = precoUnitario * item.quantidade;
    subtotal += itemSubtotal;
    return {
      ...item,
      preco_unitario: precoUnitario,
      subtotal: itemSubtotal,
    };
  });

  const taxaEntrega = dados.taxa_entrega || 0;
  const taxaServico = subtotal * 0.1; // 10% de taxa de serviço
  const total = subtotal + taxaEntrega + taxaServico;
  
  console.log('💰 Totais calculados:', JSON.stringify({
    subtotal,
    taxa_entrega: taxaEntrega,
    taxa_servico: taxaServico,
    total,
  }, null, 2));

  // 4. Criar pedido
  // Log para debug: verificar se está tentando criar pedido de mesa sem autenticação
  const isPedidoAnonimo = dados.id_mesa && !userId;
  
  if (isPedidoAnonimo) {
    console.log('📝 Criando pedido de mesa (anon):', JSON.stringify({
      id_mesa: dados.id_mesa,
      quantidade_itens: dados.itens.length,
    }, null, 2));
    
    // ISOLAMENTO CRÍTICO: Garantir que não há sessão interferindo
    // Limpar qualquer sessão existente no client anon ANTES de usar
    console.log('🔒 Limpando sessão do supabaseAnon...');
    try {
      await supabaseAnon.auth.signOut();
      console.log('✅ Sessão do supabaseAnon limpa');
    } catch (e) {
      console.warn('⚠️ Erro ao limpar sessão do supabaseAnon (pode ser normal):', JSON.stringify(e, null, 2));
    }
    
    // Verificar se há sessão no supabase principal que possa interferir
    const { data: sessionPrincipal } = await supabase.auth.getSession();
    if (sessionPrincipal?.session) {
      console.warn('⚠️ ATENÇÃO: Há sessão no supabase principal, mas usando supabaseAnon para pedido anônimo');
    }
  }

  // Usar client anon para pedidos de mesa sem usuário, client normal caso contrário
  const client = isPedidoAnonimo ? supabaseAnon : supabase;
  
  console.log('🔧 Cliente selecionado:', JSON.stringify({
    tipo: client === supabaseAnon ? 'anon' : 'authenticated',
    id_mesa: dados.id_mesa,
    tem_user_id: !!userId,
  }, null, 2));

  const { data: pedido, error: pedidoError } = await client
    .from('pedidos')
    .insert({
      id_usuario: userId, // null para pedidos de mesa anônimos
      id_mesa: dados.id_mesa || null,
      status: StatusPedido.PENDENTE,
      status_pagamento: 'pendente',
      tipo_pedido: dados.tipo_pedido,
      subtotal,
      taxa_entrega: taxaEntrega,
      taxa_servico: taxaServico,
      total,
      observacoes: dados.observacoes || null,
      endereco_entrega: dados.endereco_entrega || null,
    })
    .select()
    .single();

  if (pedidoError || !pedido) {
    // Serializar erro corretamente para mobile (evitar [object Object])
    const erroSerializado = JSON.stringify({
      error: pedidoError ? {
        message: pedidoError.message,
        code: pedidoError.code,
        details: pedidoError.details,
        hint: pedidoError.hint,
      } : null,
      id_mesa: dados.id_mesa,
      id_usuario: userId,
      quantidade_itens: dados.itens.length,
    }, null, 2);
    
    console.error('❌ Erro ao criar pedido:', erroSerializado);
    
    // Mensagem de erro mais detalhada
    const mensagemErro = pedidoError?.message || 'Erro ao criar pedido';
    const codigoErro = pedidoError?.code || 'UNKNOWN';
    throw new Error(`${mensagemErro} (Código: ${codigoErro})`);
  }

  console.log('✅ Pedido criado com sucesso:', JSON.stringify({
    id: pedido.id,
    id_mesa: pedido.id_mesa,
    id_usuario: pedido.id_usuario,
    status: pedido.status,
    total: pedido.total,
  }, null, 2));

  // 4.1. VALIDAÇÃO CRÍTICA: Verificar se pedido realmente existe no banco
  // Isso garante que o INSERT foi bem-sucedido e o pedido está persistido
  console.log('🔍 Validando se pedido existe no banco...');
  const { data: pedidoVerificado, error: erroVerificacao } = await client
    .from('pedidos')
    .select('id, id_mesa, id_usuario, status')
    .eq('id', pedido.id)
    .single();

  if (erroVerificacao || !pedidoVerificado) {
    const erroSerializado = JSON.stringify({
      error: erroVerificacao ? {
        message: erroVerificacao.message,
        code: erroVerificacao.code,
        details: erroVerificacao.details,
        hint: erroVerificacao.hint,
      } : null,
      id_pedido_criado: pedido.id,
      cliente: client === supabaseAnon ? 'anon' : 'authenticated',
      problema: 'Pedido não encontrado após criação',
    }, null, 2);
    
    console.error('❌ ERRO CRÍTICO: Pedido não existe no banco após criação!', erroSerializado);
    throw new Error(`Falha ao criar pedido: pedido não foi persistido no banco de dados. (Código: ${erroVerificacao?.code || 'NOT_FOUND'})`);
  }

  console.log('✅ Validação: Pedido confirmado no banco:', JSON.stringify({
    id: pedidoVerificado.id,
    id_mesa: pedidoVerificado.id_mesa,
    id_usuario: pedidoVerificado.id_usuario,
    status: pedidoVerificado.status,
  }, null, 2));

  // 5. Criar itens do pedido
  const itensParaInserir = itensComPreco.map(item => ({
    id_pedido: pedido.id,
    id_produto: item.id_produto,
    quantidade: item.quantidade,
    preco_unitario: item.preco_unitario,
    subtotal: item.subtotal,
    observacoes: item.observacoes || null,
  }));

  // Usar o mesmo client (anon ou normal) para criar itens
  console.log('📦 Criando itens do pedido:', JSON.stringify({
    quantidade_itens: itensParaInserir.length,
    id_pedido: pedido.id,
    cliente: client === supabaseAnon ? 'anon' : 'authenticated',
  }, null, 2));
  
  const { error: itensError } = await client
    .from('itens_pedido')
    .insert(itensParaInserir);

  if (itensError) {
    // Serializar erro corretamente
    const erroSerializado = JSON.stringify({
      error: {
        message: itensError.message,
        code: itensError.code,
        details: itensError.details,
        hint: itensError.hint,
      },
      id_pedido: pedido.id,
      quantidade_itens: itensParaInserir.length,
    }, null, 2);
    
    console.error('❌ Erro ao criar itens do pedido:', erroSerializado);
    
    // Rollback: deletar pedido criado usando o mesmo cliente
    try {
      await client.from('pedidos').delete().eq('id', pedido.id);
    } catch (rollbackError) {
      console.error('❌ Erro ao fazer rollback do pedido:', JSON.stringify(rollbackError, null, 2));
    }
    
    throw new Error(itensError.message || 'Erro ao criar itens do pedido');
  }

  // 6. Buscar pedido completo com relacionamentos
  // IMPORTANTE: Usar o mesmo cliente (anon ou normal) para buscar o pedido
  // Isso garante que as RLS policies permitam a leitura
  console.log('🔍 Buscando pedido completo com relacionamentos...');
  
  try {
    const pedidoCompleto = await buscarPedidoPorIdComCliente(pedido.id, client);
    console.log('✅ Pedido completo buscado com sucesso:', JSON.stringify({
      id: pedidoCompleto.id,
      quantidade_itens: pedidoCompleto.itens?.length || 0,
      tem_mesa: !!pedidoCompleto.mesa,
      tem_usuario: !!pedidoCompleto.usuario,
    }, null, 2));
    return pedidoCompleto;
  } catch (erroBusca: any) {
    // Se buscar pedido completo falhar, retornar pedido básico formatado
    // Isso evita que um erro na busca faça o pedido parecer não criado
    console.warn('⚠️ Erro ao buscar pedido completo, retornando pedido básico:', JSON.stringify({
      error: {
        message: erroBusca?.message,
        code: erroBusca?.code,
      },
      id_pedido: pedido.id,
      cliente: client === supabaseAnon ? 'anon' : 'authenticated',
    }, null, 2));
    
    // Retornar pedido básico formatado manualmente
    // Isso garante que a função sempre retorna um Pedido válido
    const pedidoBasico: Pedido = {
      id: pedido.id,
      numero_pedido: pedido.numero_pedido || 0,
      status: pedido.status as StatusPedido,
      tipo_pedido: pedido.tipo_pedido as any,
      subtotal: pedido.subtotal,
      taxa_entrega: pedido.taxa_entrega,
      taxa_servico: pedido.taxa_servico,
      total: pedido.total,
      observacoes: pedido.observacoes || undefined,
      endereco_entrega: pedido.endereco_entrega || undefined,
      id_mesa: pedido.id_mesa || undefined,
      status_pagamento: pedido.status_pagamento || undefined,
      mesa: undefined, // Não foi possível buscar relacionamento
      usuario: undefined, // Não foi possível buscar relacionamento
      itens: [], // Itens serão buscados separadamente se necessário
      data_criacao: pedido.data_criacao || new Date().toISOString(),
      data_atualizacao: pedido.data_atualizacao || new Date().toISOString(),
    };
    
    console.log('✅ Retornando pedido básico (sem relacionamentos):', JSON.stringify({
      id: pedidoBasico.id,
      id_mesa: pedidoBasico.id_mesa,
      total: pedidoBasico.total,
    }, null, 2));
    
    return pedidoBasico;
  }
};

/**
 * Lista todos os pedidos (Admin e Dono)
 * NOTA: Verificação de perfil deve ser feita no código que chama esta função
 */
export const listarTodosPedidos = async (status?: StatusPedido): Promise<Pedido[]> => {
  let query = supabase
    .from('pedidos')
    .select(`
      *,
      usuario:usuarios(
        *,
        perfil:perfis(*)
      ),
      mesa:mesas(*),
      itens:itens_pedido(
        *,
        produto:products(
          *,
          category:categories(*)
        )
      )
    `)
    .order('data_criacao', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Erro ao buscar pedidos');
  }

  return (data || []).map(formatarPedido);
};

/**
 * Lista pedidos do usuário autenticado
 */
export const listarMeusPedidos = async (): Promise<Pedido[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      usuario:usuarios(
        *,
        perfil:perfis(*)
      ),
      mesa:mesas(*),
      itens:itens_pedido(
        *,
        produto:products(
          *,
          category:categories(*)
        )
      )
    `)
    .eq('id_usuario', user.id)
    .order('data_criacao', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar pedidos');
  }

  return (data || []).map(formatarPedido);
};

/**
 * Busca pedido por ID usando um cliente específico
 * Útil para buscar pedidos criados com supabaseAnon usando o mesmo cliente
 */
const buscarPedidoPorIdComCliente = async (
  id: string, 
  cliente: SupabaseClient
): Promise<Pedido> => {
  const tipoCliente = cliente === supabaseAnon ? 'anon' : 'authenticated';
  console.log('🔍 Buscando pedido por ID:', JSON.stringify({
    id_pedido: id,
    cliente: tipoCliente,
  }, null, 2));

  const { data, error } = await cliente
    .from('pedidos')
    .select(`
      *,
      usuario:usuarios(
        *,
        perfil:perfis(*)
      ),
      mesa:mesas(*),
      itens:itens_pedido(
        *,
        produto:products(
          *,
          category:categories(*)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    // Serializar erro corretamente
    const erroSerializado = JSON.stringify({
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      } : null,
      id_pedido: id,
      cliente: tipoCliente,
      problema: error ? 'Erro na query' : 'Dados não retornados',
    }, null, 2);
    
    console.error('❌ Erro ao buscar pedido por ID:', erroSerializado);
    throw new Error(error?.message || 'Pedido não encontrado');
  }

  console.log('✅ Pedido encontrado:', JSON.stringify({
    id: data.id,
    id_mesa: data.id_mesa,
    id_usuario: data.id_usuario,
    quantidade_itens: data.itens?.length || 0,
  }, null, 2));

  return formatarPedido(data);
};

/**
 * Busca pedido por ID (usa cliente padrão supabase)
 */
export const buscarPedidoPorId = async (id: string): Promise<Pedido> => {
  return buscarPedidoPorIdComCliente(id, supabase);
};

/**
 * Busca pedido por número
 */
export const buscarPedidoPorNumero = async (numero: number): Promise<Pedido> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      usuario:usuarios(
        *,
        perfil:perfis(*)
      ),
      mesa:mesas(*),
      itens:itens_pedido(
        *,
        produto:products(
          *,
          category:categories(*)
        )
      )
    `)
    .eq('numero_pedido', numero)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Pedido não encontrado');
  }

  return formatarPedido(data);
};

/**
 * Atualiza status do pedido (Admin e Dono)
 */
export const atualizarStatusPedido = async (id: string, status: StatusPedido): Promise<Pedido> => {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Erro ao atualizar status do pedido');
  }

  return await buscarPedidoPorId(id);
};

/**
 * Cancela pedido
 */
export const cancelarPedido = async (id: string): Promise<Pedido> => {
  // Verificar se pedido pode ser cancelado (apenas pendente ou confirmado)
  const pedido = await buscarPedidoPorId(id);
  
  if (pedido.status !== StatusPedido.PENDENTE && pedido.status !== StatusPedido.CONFIRMADO) {
    throw new Error('Apenas pedidos pendentes ou confirmados podem ser cancelados');
  }

  return await atualizarStatusPedido(id, StatusPedido.CANCELADO);
};

/**
 * Obtém estatísticas de pedidos (Admin e Dono)
 */
export const obterEstatisticas = async (): Promise<EstatisticasPedidos> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('status, total');

  if (error) {
    throw new Error(error.message || 'Erro ao buscar estatísticas');
  }

  const pedidos = data || [];
  const totalPedidos = pedidos.length;
  const pendentes = pedidos.filter(p => p.status === StatusPedido.PENDENTE).length;
  const emPreparo = pedidos.filter(p => p.status === StatusPedido.EM_PREPARO).length;
  const finalizados = pedidos.filter(p => 
    p.status === StatusPedido.ENTREGUE || p.status === StatusPedido.CANCELADO
  ).length;
  const valorTotal = pedidos.reduce((acc, p) => {
    const total = typeof p.total === 'string' ? parseFloat(p.total) : p.total;
    return acc + total;
  }, 0);

  return {
    total_pedidos: totalPedidos,
    pendentes,
    em_preparo: emPreparo,
    finalizados,
    valor_total: valorTotal,
  };
};

/**
 * Formata status do pedido para exibição
 */
export const formatarStatus = (status: StatusPedido): string => {
  const statusMap: Record<StatusPedido, string> = {
    [StatusPedido.PENDENTE]: 'Pendente',
    [StatusPedido.CONFIRMADO]: 'Confirmado',
    [StatusPedido.EM_PREPARO]: 'Em Preparo',
    [StatusPedido.PRONTO]: 'Pronto',
    [StatusPedido.SAIU_ENTREGA]: 'Saiu para Entrega',
    [StatusPedido.ENTREGUE]: 'Entregue',
    [StatusPedido.CANCELADO]: 'Cancelado',
  };
  
  return statusMap[status] || status;
};

/**
 * Retorna cor do status para UI
 */
export const corDoStatus = (status: StatusPedido): string => {
  const coresMap: Record<StatusPedido, string> = {
    [StatusPedido.PENDENTE]: '#FFA500',
    [StatusPedido.CONFIRMADO]: '#2196F3',
    [StatusPedido.EM_PREPARO]: '#9C27B0',
    [StatusPedido.PRONTO]: '#4CAF50',
    [StatusPedido.SAIU_ENTREGA]: '#00BCD4',
    [StatusPedido.ENTREGUE]: '#4CAF50',
    [StatusPedido.CANCELADO]: '#F44336',
  };
  
  return coresMap[status] || '#757575';
};

/**
 * Lista pedidos por mesa
 */
export const listarPedidosPorMesa = async (mesaId: string): Promise<Pedido[]> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      usuario:usuarios(
        *,
        perfil:perfis(*)
      ),
      mesa:mesas(*),
      itens:itens_pedido(
        *,
        produto:products(
          *,
          category:categories(*)
        )
      )
    `)
    .eq('id_mesa', mesaId)
    .order('data_criacao', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar pedidos da mesa');
  }

  return (data || []).map(formatarPedido);
};

/**
 * Lista pedidos pendentes de pagamento por mesa
 */
export const listarPedidosPendentesPorMesa = async (mesaId: string): Promise<Pedido[]> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      usuario:usuarios(
        *,
        perfil:perfis(*)
      ),
      mesa:mesas(*),
      itens:itens_pedido(
        *,
        produto:products(
          *,
          category:categories(*)
        )
      )
    `)
    .eq('id_mesa', mesaId)
    .eq('status_pagamento', 'pendente')
    .neq('status', 'cancelado')
    .order('data_criacao', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar pedidos pendentes da mesa');
  }

  return (data || []).map(formatarPedido);
};


