/**
 * Service de Mesas
 * 
 * Gerencia mesas do sistema usando Supabase
 */

import { supabase } from '../lib/supabase';
import { Mesa, CriarMesaDto, AtualizarMesaDto, StatusMesa } from '../types';

/**
 * Formata dados do Supabase para o tipo Mesa
 */
const formatarMesa = (data: any): Mesa => {
  return {
    id: data.id,
    numero: data.numero,
    qr_code: data.qr_code,
    status: data.status as StatusMesa,
    capacidade: data.capacidade,
    observacoes: data.observacoes || undefined,
    data_criacao: data.data_criacao,
    data_atualizacao: data.data_atualizacao,
  };
};

/**
 * Lista todas as mesas
 */
export const listarMesas = async (): Promise<Mesa[]> => {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .order('numero', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar mesas');
  }

  return (data || []).map(formatarMesa);
};

/**
 * Busca mesa por ID
 */
export const buscarMesaPorId = async (id: string): Promise<Mesa> => {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Mesa não encontrada');
  }

  return formatarMesa(data);
};

/**
 * Busca mesa por número
 */
export const buscarMesaPorNumero = async (numero: number): Promise<Mesa> => {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('numero', numero)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Mesa não encontrada');
  }

  return formatarMesa(data);
};

/**
 * Busca mesa por QR code
 */
export const buscarMesaPorQR = async (qrCode: string): Promise<Mesa> => {
  // Buscar mesa por QR code, permitindo status 'livre' ou 'ocupada' (não 'inativa')
  console.log('🔍 Buscando mesa por QR code:', qrCode);
  
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .eq('qr_code', qrCode)
    .in('status', [StatusMesa.LIVRE, StatusMesa.OCUPADA])
    .single();

  if (error) {
    console.error('❌ Erro ao buscar mesa:', error);
    throw new Error(error.message || 'QR code inválido ou mesa inativa');
  }

  if (!data) {
    console.error('❌ Mesa não encontrada para QR code:', qrCode);
    throw new Error('QR code inválido ou mesa inativa');
  }

  console.log('✅ Mesa encontrada:', data);
  return formatarMesa(data);
};

/**
 * Gera UUID v4 simples
 */
const gerarUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Cria nova mesa com QR code único
 */
export const criarMesa = async (dados: CriarMesaDto): Promise<Mesa> => {
  // Gerar QR code único (UUID)
  const qrCode = gerarUUID();

  const { data, error } = await supabase
    .from('mesas')
    .insert({
      numero: dados.numero,
      qr_code: qrCode,
      capacidade: dados.capacidade || 4,
      observacoes: dados.observacoes || null,
      status: StatusMesa.LIVRE,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Erro ao criar mesa');
  }

  return formatarMesa(data);
};

/**
 * Atualiza mesa
 */
export const atualizarMesa = async (
  id: string,
  dados: AtualizarMesaDto
): Promise<Mesa> => {
  const updateData: any = {};

  if (dados.status !== undefined) {
    updateData.status = dados.status;
  }
  if (dados.capacidade !== undefined) {
    updateData.capacidade = dados.capacidade;
  }
  if (dados.observacoes !== undefined) {
    updateData.observacoes = dados.observacoes || null;
  }

  const { data, error } = await supabase
    .from('mesas')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Erro ao atualizar mesa');
  }

  return formatarMesa(data);
};

/**
 * Atualiza status da mesa
 */
export const atualizarStatusMesa = async (
  id: string,
  status: StatusMesa
): Promise<Mesa> => {
  return await atualizarMesa(id, { status });
};

/**
 * Deleta mesa
 */
export const deletarMesa = async (id: string): Promise<void> => {
  const { error } = await supabase.from('mesas').delete().eq('id', id);

  if (error) {
    throw new Error(error.message || 'Erro ao deletar mesa');
  }
};

/**
 * Regenera QR code de uma mesa
 */
export const regenerarQRCode = async (id: string): Promise<Mesa> => {
  const novoQRCode = gerarUUID();

  const { data, error } = await supabase
    .from('mesas')
    .update({ qr_code: novoQRCode })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Erro ao regenerar QR code');
  }

  return formatarMesa(data);
};

