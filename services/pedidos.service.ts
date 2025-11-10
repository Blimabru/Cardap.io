/**
 * Service de Pedidos
 * 
 * Gerencia pedidos do sistema
 */

import { get, post, put } from './api';
import { Pedido, CriarPedidoDto, StatusPedido, EstatisticasPedidos } from '../types';

/**
 * Cria novo pedido
 */
export const criarPedido = async (dados: CriarPedidoDto): Promise<Pedido> => {
  return await post<Pedido>('/pedidos', dados);
};

/**
 * Lista todos os pedidos (Admin e Dono)
 */
export const listarTodosPedidos = async (status?: StatusPedido): Promise<Pedido[]> => {
  const query = status ? `?status=${status}` : '';
  return await get<Pedido[]>(`/pedidos${query}`);
};

/**
 * Lista pedidos do usuário autenticado
 */
export const listarMeusPedidos = async (): Promise<Pedido[]> => {
  return await get<Pedido[]>('/pedidos/meus');
};

/**
 * Busca pedido por ID
 */
export const buscarPedidoPorId = async (id: string): Promise<Pedido> => {
  return await get<Pedido>(`/pedidos/${id}`);
};

/**
 * Busca pedido por número
 */
export const buscarPedidoPorNumero = async (numero: number): Promise<Pedido> => {
  return await get<Pedido>(`/pedidos/numero/${numero}`);
};

/**
 * Atualiza status do pedido (Admin e Dono)
 */
export const atualizarStatusPedido = async (id: string, status: StatusPedido): Promise<Pedido> => {
  return await put<Pedido>(`/pedidos/${id}/status`, { status });
};

/**
 * Cancela pedido
 */
export const cancelarPedido = async (id: string): Promise<Pedido> => {
  return await put<Pedido>(`/pedidos/${id}/cancelar`, {});
};

/**
 * Obtém estatísticas de pedidos (Admin e Dono)
 */
export const obterEstatisticas = async (): Promise<EstatisticasPedidos> => {
  return await get<EstatisticasPedidos>('/pedidos/estatisticas');
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


