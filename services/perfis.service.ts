/**
 * Service de Perfis
 * 
 * Busca perfis disponíveis no sistema
 */

import { get } from './api';
import { Perfil } from '../types';

/**
 * Lista todos os perfis ativos
 */
export const listarPerfis = async (): Promise<Perfil[]> => {
  console.log('📡 Buscando perfis da API...');
  try {
    const perfis = await get<Perfil[]>('/perfis');
    console.log('✅ Perfis carregados:', perfis.map(p => p.nome_perfil));
    return perfis;
  } catch (erro) {
    console.error('❌ Erro ao buscar perfis:', erro);
    throw erro;
  }
};

