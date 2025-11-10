/**
 * Service de Usuários
 * 
 * Gerencia operações CRUD de usuários (Admin)
 */

import { get, post, put, del } from './api';
import { Usuario } from '../types';

/**
 * Lista todos os usuários (Admin e Dono)
 */
export const listarUsuarios = async (): Promise<Usuario[]> => {
  return await get<Usuario[]>('/usuarios');
};

/**
 * Busca usuário por ID
 */
export const buscarUsuarioPorId = async (id: string): Promise<Usuario> => {
  return await get<Usuario>(`/usuarios/${id}`);
};

/**
 * Lista usuários por perfil
 */
export const listarUsuariosPorPerfil = async (nomePerfil: string): Promise<Usuario[]> => {
  return await get<Usuario[]>(`/usuarios/perfil/${nomePerfil}`);
};

/**
 * Cria novo usuário (Admin)
 */
export const criarUsuario = async (dados: {
  nome_completo: string;
  email: string;
  senha: string;
  id_perfil: string;
  telefone?: string;
  foto_perfil_url?: string;
  ativo?: boolean;
}): Promise<Usuario> => {
  console.log('📡 Service: Criando usuário via API...');
  console.log('📤 Dados:', { ...dados, senha: '***' });
  
  try {
    const resultado = await post<Usuario>('/usuarios', dados);
    console.log('✅ Service: Usuário criado com sucesso!', resultado);
    return resultado;
  } catch (erro) {
    console.error('❌ Service: Erro ao criar usuário:', erro);
    throw erro;
  }
};

/**
 * Atualiza usuário (Admin)
 */
export const atualizarUsuario = async (id: string, dados: Partial<{
  nome_completo: string;
  email: string;
  telefone: string;
  foto_perfil_url: string;
  id_perfil: string;
  ativo: boolean;
  nova_senha: string;
}>): Promise<Usuario> => {
  return await put<Usuario>(`/usuarios/${id}`, dados);
};

/**
 * Desativa usuário (Admin)
 */
export const desativarUsuario = async (id: string): Promise<void> => {
  return await put(`/usuarios/${id}/desativar`, {});
};

/**
 * Reativa usuário (Admin)
 */
export const reativarUsuario = async (id: string): Promise<void> => {
  return await put(`/usuarios/${id}/reativar`, {});
};

/**
 * Deleta usuário permanentemente (Admin)
 */
export const deletarUsuario = async (id: string): Promise<void> => {
  return await del(`/usuarios/${id}`);
};

