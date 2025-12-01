/**
 * Service de Usuários
 * 
 * Gerencia operações CRUD de usuários usando Supabase
 * NOTA: Para criar usuários, é necessário usar service_role key ou Edge Function
 * Por enquanto, apenas leitura e atualização são permitidas
 */

import { supabase } from '../lib/supabase';
import { Usuario } from '../types';

/**
 * Formata dados do Supabase para o tipo Usuario
 */
const formatarUsuario = (data: any): Usuario => {
  return {
    id: data.id,
    nome_completo: data.nome_completo,
    email: data.email,
    telefone: data.telefone || undefined,
    foto_perfil_url: data.foto_perfil_url || undefined,
    ativo: data.ativo,
    email_verificado: data.email_verificado,
    perfil: data.perfil ? {
      id: data.perfil.id,
      nome_perfil: data.perfil.nome_perfil as 'Administrador' | 'Dono' | 'Cliente',
      descricao: data.perfil.descricao || '',
      permissoes: data.perfil.permissoes,
      ativo: data.perfil.ativo,
      data_criacao: data.perfil.data_criacao,
      data_atualizacao: data.perfil.data_atualizacao,
    } : {} as any,
    data_criacao: data.data_criacao,
    data_atualizacao: data.data_atualizacao,
  };
};

/**
 * Lista todos os usuários (Admin e Dono)
 * NOTA: Verificação de perfil deve ser feita no código que chama esta função
 */
export const listarUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      perfil:perfis(*)
    `)
    .order('nome_completo', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar usuários');
  }

  return (data || []).map(formatarUsuario);
};

/**
 * Busca usuário por ID
 */
export const buscarUsuarioPorId = async (id: string): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      perfil:perfis(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Usuário não encontrado');
  }

  return formatarUsuario(data);
};

/**
 * Lista usuários por perfil
 */
export const listarUsuariosPorPerfil = async (nomePerfil: string): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      perfil:perfis(*)
    `)
    .eq('perfil.nome_perfil', nomePerfil)
    .order('nome_completo', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Erro ao buscar usuários por perfil');
  }

  return (data || []).map(formatarUsuario);
};

/**
 * Cria novo usuário (Admin)
 * 
 * NOTA: Esta função requer service_role key ou Edge Function.
 * Por enquanto, lança erro informando que deve ser feito via Supabase Dashboard
 * ou Edge Function.
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
  console.log('📡 Service: Criando usuário via Supabase...');
  console.log('📤 Dados:', { ...dados, senha: '***' });
  
  // NOTA: Criar usuário no Supabase Auth requer service_role key
  // Por enquanto, vamos tentar criar via signUp (mas isso envia email de confirmação)
  // Em produção, use Edge Function ou service_role key no backend
  
  // 1. Criar no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: dados.email,
    password: dados.senha,
    options: {
      data: {
        nome_completo: dados.nome_completo,
        telefone: dados.telefone || '',
      },
    },
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Erro ao criar usuário no Supabase Auth');
  }

  // 2. Criar registro na tabela usuarios
  const { error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      nome_completo: dados.nome_completo,
      email: dados.email,
      telefone: dados.telefone || null,
      foto_perfil_url: dados.foto_perfil_url || null,
      id_perfil: dados.id_perfil,
      ativo: dados.ativo !== undefined ? dados.ativo : true,
      email_verificado: false,
    });

  if (usuarioError) {
    // Rollback: fazer logout (não podemos deletar sem service_role)
    await supabase.auth.signOut();
    throw new Error(usuarioError.message || 'Erro ao criar perfil do usuário');
  }

  // 3. Buscar usuário completo
  return await buscarUsuarioPorId(authData.user.id);
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
  const updateData: any = {};
  if (dados.nome_completo !== undefined) updateData.nome_completo = dados.nome_completo;
  if (dados.email !== undefined) updateData.email = dados.email;
  if (dados.telefone !== undefined) updateData.telefone = dados.telefone || null;
  if (dados.foto_perfil_url !== undefined) updateData.foto_perfil_url = dados.foto_perfil_url || null;
  if (dados.id_perfil !== undefined) updateData.id_perfil = dados.id_perfil;
  if (dados.ativo !== undefined) updateData.ativo = dados.ativo;

  // Atualizar na tabela usuarios
  const { error } = await supabase
    .from('usuarios')
    .update(updateData)
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Erro ao atualizar usuário');
  }

  // Se houver nova senha, atualizar no Supabase Auth
  if (dados.nova_senha) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: dados.nova_senha,
    });

    if (passwordError) {
      throw new Error(passwordError.message || 'Erro ao atualizar senha');
    }
  }

  // Buscar usuário atualizado
  return await buscarUsuarioPorId(id);
};

/**
 * Desativa usuário (Admin)
 */
export const desativarUsuario = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('usuarios')
    .update({ ativo: false })
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Erro ao desativar usuário');
  }
};

/**
 * Reativa usuário (Admin)
 */
export const reativarUsuario = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('usuarios')
    .update({ ativo: true })
    .eq('id', id);

  if (error) {
    throw new Error(error.message || 'Erro ao reativar usuário');
  }
};

/**
 * Deleta usuário permanentemente (Admin)
 * 
 * NOTA: Requer service_role key para deletar do Supabase Auth
 * Por enquanto, apenas desativa o usuário
 */
export const deletarUsuario = async (id: string): Promise<void> => {
  // Por segurança, apenas desativar ao invés de deletar
  // Para deletar completamente, use Supabase Dashboard ou Edge Function
  await desativarUsuario(id);
  
  // Se realmente quiser deletar, descomente abaixo (requer service_role):
  // const { error } = await supabase.auth.admin.deleteUser(id);
  // if (error) {
  //   throw new Error(error.message || 'Erro ao deletar usuário');
  // }
};

