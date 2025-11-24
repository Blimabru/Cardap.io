/**
 * Service de Perfis
 * 
 * Busca perfis disponíveis no sistema usando Supabase
 */

import { supabase } from '../lib/supabase';
import { Perfil } from '../types';

/**
 * Lista todos os perfis ativos
 */
export const listarPerfis = async (): Promise<Perfil[]> => {
  console.log('📡 Buscando perfis do Supabase...');
  try {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('ativo', true)
      .order('nome_perfil', { ascending: true });

    if (error) {
      throw new Error(error.message || 'Erro ao buscar perfis');
    }

    const perfis = (data || []).map(p => ({
      id: p.id,
      nome_perfil: p.nome_perfil as 'Administrador' | 'Dono' | 'Cliente',
      descricao: p.descricao || '',
      permissoes: p.permissoes,
      ativo: p.ativo,
      data_criacao: p.data_criacao,
      data_atualizacao: p.data_atualizacao,
    }));

    console.log('✅ Perfis carregados:', perfis.map(p => p.nome_perfil));
    return perfis;
  } catch (erro) {
    console.error('❌ Erro ao buscar perfis:', erro);
    throw erro;
  }
};

