/**
 * Service de Categorias
 * 
 * Gerencia operações CRUD de categorias usando Supabase
 */

import { supabase } from '../lib/supabase';
import { Categoria } from '../types';

/**
 * Lista todas as categorias
 */
export const listarCategorias = async (): Promise<Categoria[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar categorias');
  }

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
  }));
};

/**
 * Busca categoria por ID
 */
export const buscarCategoriaPorId = async (id: string): Promise<Categoria> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Categoria não encontrada');
  }

  return {
    id: data.id,
    name: data.name,
  };
};

/**
 * Cria nova categoria (Admin e Dono)
 * NOTA: Verificação de perfil deve ser feita no código que chama esta função
 */
export const criarCategoria = async (dados: {
  name: string;
}): Promise<Categoria> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: dados.name })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Erro ao criar categoria');
  }

  return {
    id: data.id,
    name: data.name,
  };
};

/**
 * Atualiza categoria existente (Admin e Dono)
 */
export const atualizarCategoria = async (id: string, dados: {
  name: string;
}): Promise<Categoria> => {
  const { data, error } = await supabase
    .from('categories')
    .update({ name: dados.name })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Erro ao atualizar categoria');
  }

  return {
    id: data.id,
    name: data.name,
  };
};

/**
 * Deleta categoria (Admin e Dono)
 */
export const deletarCategoria = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Erro ao deletar categoria');
  }
};

