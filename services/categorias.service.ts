/**
 * Service de Categorias
 * 
 * Gerencia operações CRUD de categorias
 */

import { get, post, put, del } from './api';
import { Categoria } from '../types';

/**
 * Lista todas as categorias
 */
export const listarCategorias = async (): Promise<Categoria[]> => {
  return await get<Categoria[]>('/categories');
};

/**
 * Busca categoria por ID
 */
export const buscarCategoriaPorId = async (id: string): Promise<Categoria> => {
  return await get<Categoria>(`/categories/${id}`);
};

/**
 * Cria nova categoria (Admin e Dono)
 */
export const criarCategoria = async (dados: {
  name: string;
}): Promise<Categoria> => {
  return await post<Categoria>('/categories', dados);
};

/**
 * Atualiza categoria existente (Admin e Dono)
 */
export const atualizarCategoria = async (id: string, dados: {
  name: string;
}): Promise<Categoria> => {
  return await put<Categoria>(`/categories/${id}`, dados);
};

/**
 * Deleta categoria (Admin e Dono)
 */
export const deletarCategoria = async (id: string): Promise<void> => {
  return await del(`/categories/${id}`);
};

