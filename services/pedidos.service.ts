/**
 * Service de Pedidos
 * 
 * Gerencia pedidos do sistema usando Supabase
 */

import { supabase } from '../lib/supabase';
import { Pedido, CriarPedidoDto, StatusPedido, EstatisticasPedidos, ItemPedido, Usuario, Produto } from '../types';

/**
 * Formata dados do Supabase para o tipo Pedido
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
  // 1. Obter usuário autenticado (se não for pedido por mesa)
  let userId: string | null = null;
  
  if (!dados.id_mesa) {
    // Pedido normal requer autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado. Para fazer pedidos sem login, você precisa estar em uma mesa (via QR code).');
    }
    userId = user.id;
  }
  // Se for pedido por mesa (id_mesa presente), userId pode ser null (pedido anônimo permitido)
  
  // Validação: Pedido deve ter id_usuario OU id_mesa
  if (!userId && !dados.id_mesa) {
    throw new Error('Pedido inválido: é necessário estar autenticado ou fazer pedido via mesa (QR code).');
  }

  // 2. Buscar produtos para calcular preços
  const produtosIds = dados.itens.map(item => item.id_produto);
  const { data: produtos, error: produtosError } = await supabase
    .from('products')
    .select('id, price')
    .in('id', produtosIds);

  if (produtosError || !produtos) {
    throw new Error('Erro ao buscar produtos');
  }

  // 3. Calcular totais
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

  // 4. Criar pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      id_usuario: userId,
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
    throw new Error(pedidoError?.message || 'Erro ao criar pedido');
  }

  // 5. Criar itens do pedido
  const itensParaInserir = itensComPreco.map(item => ({
    id_pedido: pedido.id,
    id_produto: item.id_produto,
    quantidade: item.quantidade,
    preco_unitario: item.preco_unitario,
    subtotal: item.subtotal,
    observacoes: item.observacoes || null,
  }));

  const { error: itensError } = await supabase
    .from('itens_pedido')
    .insert(itensParaInserir);

  if (itensError) {
    // Rollback: deletar pedido criado
    await supabase.from('pedidos').delete().eq('id', pedido.id);
    throw new Error(itensError.message || 'Erro ao criar itens do pedido');
  }

  // 6. Buscar pedido completo com relacionamentos
  return await buscarPedidoPorId(pedido.id);
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
 * Busca pedido por ID
 */
export const buscarPedidoPorId = async (id: string): Promise<Pedido> => {
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
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Pedido não encontrado');
  }

  return formatarPedido(data);
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


