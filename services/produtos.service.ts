/**
 * Service de Produtos
 * 
 * Gerencia operações CRUD de produtos
 */

import { get, post, put, del } from './api';
import { Produto } from '../types';

/**
 * Lista todos os produtos
 */
export const listarProdutos = async (): Promise<Produto[]> => {
  return await get<Produto[]>('/products');
};

/**
 * Busca produto por ID
 */
export const buscarProdutoPorId = async (id: string): Promise<Produto> => {
  return await get<Produto>(`/products/${id}`);
};

/**
 * Cria novo produto (Admin e Dono)
 */
export const criarProduto = async (dados: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  rating?: number;
}): Promise<Produto> => {
  return await post<Produto>('/products', dados);
};

/**
 * Atualiza produto existente (Admin e Dono)
 */
export const atualizarProduto = async (id: string, dados: Partial<{
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  rating: number;
}>): Promise<Produto> => {
  return await put<Produto>(`/products/${id}`, dados);
};

/**
 * Deleta produto (Admin e Dono)
 */
export const deletarProduto = async (id: string): Promise<void> => {
  console.log('📡 Chamando API para deletar produto ID:', id);
  try {
    const resultado = await del(`/products/${id}`);
    console.log('✅ API retornou sucesso:', resultado);
    return resultado;
  } catch (erro) {
    console.error('❌ Erro na API ao deletar:', erro);
    throw erro;
  }
};

/**
 * Busca produtos por categoria
 */
export const buscarProdutosPorCategoria = async (categoryId: string): Promise<Produto[]> => {
  const produtos = await listarProdutos();
  return produtos.filter(p => p.category.id === categoryId);
};

