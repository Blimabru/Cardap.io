/**
 * Service de Rendimentos
 * 
 * Gerencia rendimentos do restaurante usando Supabase
 */

import { supabase } from '../lib/supabase';
import { RegistrarRendimentoDto, Rendimento } from '../types';

/**
 * Formata dados do Supabase para o tipo Rendimento
 */
const formatarRendimento = (data: any): Rendimento => {
  return {
    id: data.id,
    id_conta_mesa: data.id_conta_mesa,
    valor: typeof data.valor === 'string' ? parseFloat(data.valor) : data.valor,
    forma_pagamento: data.forma_pagamento,
    observacoes: data.observacoes || undefined,
    data_pagamento: data.data_pagamento,
    data_criacao: data.data_criacao,
    data_atualizacao: data.data_atualizacao,
    conta_mesa: data.conta_mesa ? {
      id: data.conta_mesa.id,
      id_mesa: data.conta_mesa.id_mesa,
      status: data.conta_mesa.status,
      total: typeof data.conta_mesa.total === 'string' ? parseFloat(data.conta_mesa.total) : data.conta_mesa.total,
      forma_pagamento: data.conta_mesa.forma_pagamento,
      data_abertura: data.conta_mesa.data_abertura,
      data_fechamento: data.conta_mesa.data_fechamento || undefined,
      data_pagamento: data.conta_mesa.data_pagamento || undefined,
    } : undefined,
  };
};

/**
 * Registra um novo rendimento
 */
export const registrarRendimento = async (dados: RegistrarRendimentoDto): Promise<Rendimento> => {
  // Validar valor positivo
  const valor = typeof dados.valor === 'string' ? parseFloat(dados.valor) : Number(dados.valor);
  
  if (isNaN(valor) || valor <= 0) {
    throw new Error('Valor do rendimento deve ser maior que zero');
  }

  // Chamar função RPC do Supabase
  const { data: rendimentoId, error } = await supabase.rpc('registrar_rendimento', {
    p_conta_id: dados.id_conta_mesa,
    p_valor: valor,
    p_forma_pagamento: dados.forma_pagamento,
  });

  if (error) {
    throw new Error(error.message || 'Erro ao registrar rendimento');
  }

  // Buscar rendimento criado
  const { data: rendimento, error: rendimentoError } = await supabase
    .from('rendimentos')
    .select(`
      *,
      conta_mesa:contas_mesa(*)
    `)
    .eq('id', rendimentoId)
    .single();

  if (rendimentoError || !rendimento) {
    throw new Error(rendimentoError?.message || 'Erro ao buscar rendimento criado');
  }

  return formatarRendimento(rendimento);
};

/**
 * Lista rendimentos com filtros opcionais
 */
export const listarRendimentos = async (filtros?: {
  data_inicio?: string;
  data_fim?: string;
  forma_pagamento?: string;
}): Promise<Rendimento[]> => {
  let query = supabase
    .from('rendimentos')
    .select(`
      *,
      conta_mesa:contas_mesa(*)
    `)
    .order('data_pagamento', { ascending: false });

  if (filtros?.data_inicio) {
    query = query.gte('data_pagamento', filtros.data_inicio);
  }

  if (filtros?.data_fim) {
    query = query.lte('data_pagamento', filtros.data_fim);
  }

  if (filtros?.forma_pagamento) {
    query = query.eq('forma_pagamento', filtros.forma_pagamento);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Erro ao buscar rendimentos');
  }

  return (data || []).map(formatarRendimento);
};

/**
 * Obtém total de rendimentos em um período
 */
export const obterTotalRendimentos = async (periodo?: {
  data_inicio?: string;
  data_fim?: string;
}): Promise<number> => {
  let query = supabase
    .from('rendimentos')
    .select('valor');

  if (periodo?.data_inicio) {
    query = query.gte('data_pagamento', periodo.data_inicio);
  }

  if (periodo?.data_fim) {
    query = query.lte('data_pagamento', periodo.data_fim);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Erro ao calcular total de rendimentos');
  }

  return (data || []).reduce((total, rendimento) => {
    const valor = typeof rendimento.valor === 'string' ? parseFloat(rendimento.valor) : rendimento.valor;
    return total + valor;
  }, 0);
};

/**
 * Obtém rendimentos do dia atual
 */
export const obterRendimentosDoDia = async (): Promise<number> => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojeInicio = hoje.toISOString();

  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);
  const amanhaInicio = amanha.toISOString();

  return obterTotalRendimentos({
    data_inicio: hojeInicio,
    data_fim: amanhaInicio,
  });
};

/**
 * Obtém rendimentos do mês atual
 */
export const obterRendimentosDoMes = async (): Promise<number> => {
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  primeiroDiaMes.setHours(0, 0, 0, 0);
  const mesInicio = primeiroDiaMes.toISOString();

  const primeiroDiaProximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
  const mesFim = primeiroDiaProximoMes.toISOString();

  return obterTotalRendimentos({
    data_inicio: mesInicio,
    data_fim: mesFim,
  });
};

