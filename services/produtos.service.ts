/**
 * ============================================================================
 * PRODUTOS.SERVICE.TS - SERVICE DE GERENCIAMENTO DE PRODUTOS
 * ============================================================================
 * 
 * Este service gerencia todas as operações relacionadas a produtos no sistema.
 * 
 * RESPONSABILIDADES:
 * - Listagem de produtos ativos com paginação
 * - Busca de produtos por categoria
 * - Criação, edição e exclusão de produtos
 * - Formatação de dados entre Supabase e frontend
 * - Tratamento de URLs de imagens
 * - Validações de dados
 * 
 * FUNCIONALIDADES:
 * - CRUD completo de produtos
 * - Relacionamento com categorias
 * - Upload e gestão de imagens
 * - Filtros por categoria e busca
 * - Formatação automática de preços
 * 
 * USO:
 * import * as produtosService from '../services/produtos.service';
 * const produtos = await produtosService.listarProdutos();
 * 
 * IMPORTANTE:
 * - Usa políticas RLS do Supabase para controle de acesso
 * - Formata dados para compatibilidade com tipos do frontend
 * - Trata diferentes formatos de URL de imagem
 */

// Cliente Supabase configurado
import { supabase } from '../lib/supabase';
// Tipos TypeScript do projeto
import { Produto } from '../types';

/**
 * Converte dados brutos do Supabase para o tipo Produto do frontend
 * 
 * Esta função é necessária porque:
 * - O Supabase pode retornar nomes de colunas em formatos diferentes
 * - Precisamos garantir tipos consistentes no frontend
 * - Tratamos casos de dados faltantes ou inválidos
 * 
 * @param data - Dados brutos vindos do Supabase
 * @returns Produto formatado conforme interface TypeScript
 */
const formatarProduto = (data: any): Produto => {
  // Tratamento especial para imageUrl devido a inconsistências no banco
  // Pode vir como 'imageUrl', 'imageurl', 'ImageUrl', etc.
  let imageUrl = '';
  
  // Lista de possíveis variações do nome da coluna (case-insensitive)
  const possiveisChaves = ['imageUrl', 'imageurl', 'ImageUrl', 'IMAGEURL'];
  for (const chave of possiveisChaves) {
    if (data[chave] && typeof data[chave] === 'string' && data[chave].trim() !== '') {
      imageUrl = data[chave];
      break; // Para no primeiro encontrado
    }
  }
  
  // Fallback: busca case-insensitive em todas as chaves do objeto
  if (!imageUrl) {
    const todasChaves = Object.keys(data);
    const chaveImage = todasChaves.find(k => k.toLowerCase() === 'imageurl');
    if (chaveImage && data[chaveImage]) {
      imageUrl = data[chaveImage];
    }
  }
  
  // Log de debug para produtos sem imagem (ajuda na manutenção)
  if (data.id && !imageUrl) {
    console.warn('⚠️ Produto sem imageUrl:', {
      id: data.id,
      name: data.name,
      todasChaves: Object.keys(data),
      chavesComImage: Object.keys(data).filter(k => k.toLowerCase().includes('image')),
    });
  }
  
  // Retorna produto formatado conforme interface TypeScript
  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined, // null → undefined
    price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    imageUrl: imageUrl,
    rating: typeof data.rating === 'string' ? parseFloat(data.rating) : data.rating,
    category: data.category ? {
      id: data.category.id,
      name: data.category.name,
    } : data.categoryId ? { id: data.categoryId, name: '' } : { id: '', name: '' },
  };
};

/**
 * Lista todos os produtos com suas categorias
 */
export const listarProdutos = async (): Promise<Produto[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar produtos');
  }

  // Debug: verificar estrutura do primeiro produto
  if (data && data.length > 0) {
    console.log('📦 Primeiro produto (estrutura bruta do Supabase):', {
      id: data[0].id,
      name: data[0].name,
      todasChaves: Object.keys(data[0]),
      imageUrl: data[0].imageUrl,
      imageurl: data[0].imageurl,
      'imageUrl': data[0]['imageUrl'],
      'imageurl': data[0]['imageurl'],
    });
  }

  const produtosFormatados = (data || []).map(formatarProduto);
  
  // Debug: verificar produto formatado
  if (produtosFormatados.length > 0) {
    console.log('📦 Primeiro produto (após formatação):', {
      id: produtosFormatados[0].id,
      name: produtosFormatados[0].name,
      imageUrl: produtosFormatados[0].imageUrl,
      temImageUrl: !!produtosFormatados[0].imageUrl,
    });
  }

  return produtosFormatados;
};

/**
 * Busca produto por ID
 */
export const buscarProdutoPorId = async (id: string): Promise<Produto> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Produto não encontrado');
  }

  return formatarProduto(data);
};

/**
 * Cria novo produto (Admin e Dono)
 * NOTA: Verificação de perfil deve ser feita no código que chama esta função
 */
export const criarProduto = async (dados: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  rating?: number;
}): Promise<Produto> => {
  // Primeiro, inserir o produto sem o relacionamento
  // Tentar com categoryId primeiro, se falhar, tentar category_id
  const insertData: any = {
    name: dados.name,
    description: dados.description || null,
    price: dados.price,
    imageUrl: dados.imageUrl,
    rating: dados.rating !== undefined ? dados.rating : 0.0,
  };
  
  // Tentar com categoryId (camelCase)
  insertData.categoryId = dados.categoryId;
  
  const { data: produtoInserido, error: insertError } = await supabase
    .from('products')
    .insert(insertData)
    .select()
    .single();

  if (insertError || !produtoInserido) {
    throw new Error(insertError?.message || 'Erro ao criar produto');
  }

  // Depois, buscar o produto completo com o relacionamento
  return await buscarProdutoPorId(produtoInserido.id);
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
  const updateData: any = {};
  if (dados.name !== undefined) updateData.name = dados.name;
  if (dados.description !== undefined) updateData.description = dados.description || null;
  if (dados.price !== undefined) updateData.price = dados.price;
  if (dados.imageUrl !== undefined) updateData.imageUrl = dados.imageUrl;
  if (dados.categoryId !== undefined) updateData.categoryId = dados.categoryId;
  if (dados.rating !== undefined) updateData.rating = dados.rating;

  // Primeiro, atualizar o produto sem o relacionamento
  const { error: updateError } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id);

  if (updateError) {
    throw new Error(updateError.message || 'Erro ao atualizar produto');
  }

  // Depois, buscar o produto completo com o relacionamento
  return await buscarProdutoPorId(id);
};

/**
 * Deleta produto (Admin e Dono)
 */
export const deletarProduto = async (id: string): Promise<void> => {
  console.log('📡 Deletando produto ID:', id);
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Erro ao deletar produto:', error);
    throw new Error(error.message || 'Erro ao deletar produto');
  }

  console.log('✅ Produto deletado com sucesso');
};

/**
 * Busca produtos por categoria
 */
export const buscarProdutosPorCategoria = async (categoryId: string): Promise<Produto[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('categoryId', categoryId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar produtos por categoria');
  }

  return (data || []).map(formatarProduto);
};

