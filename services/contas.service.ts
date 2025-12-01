/**
 * Service de Contas de Mesa
 * 
 * Gerencia contas de mesa usando Supabase
 */

import { supabase } from '../lib/supabase';
import { ContaMesa, FecharContaDto, FinalizarPagamentoDto, FormaPagamento, StatusConta } from '../types';

/**
 * Formata dados do Supabase para o tipo ContaMesa
 */
const formatarConta = (data: any): ContaMesa => {
  return {
    id: data.id,
    id_mesa: data.id_mesa,
    status: data.status as StatusConta,
    total: typeof data.total === 'string' ? parseFloat(data.total) : data.total,
    forma_pagamento: data.forma_pagamento as FormaPagamento | undefined,
    observacoes: data.observacoes || undefined,
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
    data_abertura: data.data_abertura,
    data_fechamento: data.data_fechamento || undefined,
    data_pagamento: data.data_pagamento || undefined,
    data_criacao: data.data_criacao,
    data_atualizacao: data.data_atualizacao,
  };
};

/**
 * Fecha conta da mesa (agrupa pedidos e calcula total)
 */
export const fecharContaMesa = async (dados: FecharContaDto): Promise<ContaMesa> => {
  // Chamar função RPC do Supabase
  const { data, error } = await supabase.rpc('fechar_conta_mesa', {
    p_mesa_id: dados.id_mesa,
  });

  if (error) {
    throw new Error(error.message || 'Erro ao fechar conta da mesa');
  }

  // Buscar conta criada
  const { data: conta, error: contaError } = await supabase
    .from('contas_mesa')
    .select(`
      *,
      mesa:mesas(*)
    `)
    .eq('id_mesa', dados.id_mesa)
    .eq('status', StatusConta.FECHADA)
    .order('data_fechamento', { ascending: false })
    .limit(1)
    .single();

  if (contaError || !conta) {
    throw new Error(contaError?.message || 'Erro ao buscar conta criada');
  }

  return formatarConta(conta);
};

/**
 * Finaliza pagamento da conta
 * Nota: A função RPC já atualiza o status da mesa para 'livre' e marca pedidos como pagos
 */
export const finalizarPagamento = async (dados: FinalizarPagamentoDto): Promise<ContaMesa> => {
  // Chamar função RPC do Supabase
  const { data, error } = await supabase.rpc('finalizar_pagamento_conta', {
    p_conta_id: dados.conta_id,
    p_forma_pagamento: dados.forma_pagamento,
  });

  if (error) {
    throw new Error(error.message || 'Erro ao finalizar pagamento');
  }

  // Buscar conta atualizada
  const { data: conta, error: contaError } = await supabase
    .from('contas_mesa')
    .select(`
      *,
      mesa:mesas(*)
    `)
    .eq('id', dados.conta_id)
    .single();

  if (contaError || !conta) {
    throw new Error(contaError?.message || 'Erro ao buscar conta atualizada');
  }

  return formatarConta(conta);
};

/**
 * Lista contas abertas (para admin)
 */
export const listarContasAbertas = async (): Promise<ContaMesa[]> => {
  const { data, error } = await supabase
    .from('contas_mesa')
    .select(`
      *,
      mesa:mesas(*)
    `)
    .eq('status', StatusConta.ABERTA)
    .order('data_abertura', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar contas abertas');
  }

  return (data || []).map(formatarConta);
};

/**
 * Lista contas fechadas (para admin)
 */
export const listarContasFechadas = async (): Promise<ContaMesa[]> => {
  const { data, error } = await supabase
    .from('contas_mesa')
    .select(`
      *,
      mesa:mesas(*)
    `)
    .in('status', [StatusConta.FECHADA, StatusConta.PAGA])
    .order('data_fechamento', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar contas fechadas');
  }

  return (data || []).map(formatarConta);
};

/**
 * Busca conta por ID
 */
export const buscarContaPorId = async (id: string): Promise<ContaMesa> => {
  const { data, error } = await supabase
    .from('contas_mesa')
    .select(`
      *,
      mesa:mesas(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Conta não encontrada');
  }

  return formatarConta(data);
};

/**
 * Lista contas por mesa
 */
export const listarContasPorMesa = async (mesaId: string): Promise<ContaMesa[]> => {
  const { data, error } = await supabase
    .from('contas_mesa')
    .select(`
      *,
      mesa:mesas(*)
    `)
    .eq('id_mesa', mesaId)
    .order('data_abertura', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar contas da mesa');
  }

  return (data || []).map(formatarConta);
};

/**
 * Busca conta aberta da mesa (se houver)
 */
export const buscarContaAberta = async (mesaId: string): Promise<ContaMesa | null> => {
  const { data, error } = await supabase
    .from('contas_mesa')
    .select(`
      *,
      mesa:mesas(*)
    `)
    .eq('id_mesa', mesaId)
    .eq('status', StatusConta.ABERTA)
    .order('data_abertura', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Erro ao buscar conta aberta');
  }

  return data ? formatarConta(data) : null;
};

