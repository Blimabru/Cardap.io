/**
 * Service de Autenticação
 * 
 * Gerencia login, registro e validação de usuários usando Supabase Auth
 */

import { supabase } from '../lib/supabase';
import { DadosLogin, DadosRegistro, RespostaAutenticacao, Usuario } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_USUARIO = '@cardapio:usuario';

/**
 * Busca dados completos do usuário na tabela usuarios
 */
const buscarDadosUsuario = async (userId: string): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      perfil:perfis(*)
    `)
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error('Usuário não encontrado');
  }

  // Formatar para o tipo Usuario esperado
  return {
    id: data.id,
    nome_completo: data.nome_completo,
    email: data.email,
    telefone: data.telefone || undefined,
    foto_perfil_url: data.foto_perfil_url || undefined,
    ativo: data.ativo,
    email_verificado: data.email_verificado,
    perfil: {
      id: data.perfil.id,
      nome_perfil: data.perfil.nome_perfil as 'Administrador' | 'Dono' | 'Cliente',
      descricao: data.perfil.descricao || '',
      permissoes: data.perfil.permissoes,
      ativo: data.perfil.ativo,
      data_criacao: data.perfil.data_criacao,
      data_atualizacao: data.perfil.data_atualizacao,
    },
    data_criacao: data.data_criacao,
    data_atualizacao: data.data_atualizacao,
  };
};

/**
 * Faz login de usuário usando Supabase Auth
 */
export const fazerLogin = async (dados: DadosLogin): Promise<RespostaAutenticacao> => {
  console.log('🔄 Service: Iniciando login com Supabase...');
  
  // Autentica com Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: dados.email,
    password: dados.senha,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Credenciais inválidas');
  }

  // Busca dados completos do usuário na tabela usuarios
  const usuario = await buscarDadosUsuario(authData.user.id);

  // Verifica se usuário está ativo
  if (!usuario.ativo) {
    await supabase.auth.signOut();
    throw new Error('Usuário desativado');
  }

  // Salva usuário no AsyncStorage
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));

  // Retorna no formato esperado
  return {
    usuario,
    token: authData.session?.access_token || '',
    tipo_token: 'Bearer' as const,
  };
};

/**
 * Faz registro de novo cliente usando Supabase Auth
 */
export const fazerRegistro = async (dados: DadosRegistro): Promise<RespostaAutenticacao> => {
  console.log('🔄 Service: Iniciando registro com Supabase...');

  // 1. Criar usuário no Supabase Auth
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
    throw new Error(authError?.message || 'Erro ao criar usuário');
  }

  // 2. Buscar perfil "Cliente"
  const { data: perfilCliente, error: perfilError } = await supabase
    .from('perfis')
    .select('id')
    .eq('nome_perfil', 'Cliente')
    .single();

  if (perfilError || !perfilCliente) {
    // Se não encontrar perfil Cliente, faz logout (não podemos deletar sem service_role)
    await supabase.auth.signOut();
    throw new Error('Perfil Cliente não encontrado. Contate o administrador.');
  }

  // 3. Criar registro na tabela usuarios
  const { error: usuarioError } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      nome_completo: dados.nome_completo,
      email: dados.email,
      telefone: dados.telefone || null,
      foto_perfil_url: dados.foto_perfil_url || null,
      id_perfil: perfilCliente.id,
      ativo: true,
      email_verificado: false,
    });

  if (usuarioError) {
    // Se falhar, faz logout (não podemos deletar sem service_role)
    await supabase.auth.signOut();
    throw new Error(usuarioError.message || 'Erro ao criar perfil do usuário');
  }

  // 4. Buscar dados completos do usuário
  const usuario = await buscarDadosUsuario(authData.user.id);

  // 5. Salvar no AsyncStorage
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));

  // 6. Retornar resposta
  return {
    usuario,
    token: authData.session?.access_token || '',
    tipo_token: 'Bearer' as const,
  };
};

/**
 * Faz logout do usuário
 */
export const fazerLogout = async (): Promise<void> => {
  console.log('🔄 Service: Iniciando logout...');
  
  // Faz logout no Supabase
  await supabase.auth.signOut();
  
  // Remove usuário do AsyncStorage
  console.log('🗑️ Removendo usuário do AsyncStorage...');
  await AsyncStorage.removeItem(CHAVE_USUARIO);
  
  console.log('✅ Service: Logout completo!');
};

/**
 * Obtém token armazenado (agora via Supabase session)
 */
export const obterTokenArmazenado = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

/**
 * Obtém usuário armazenado
 */
export const obterUsuarioArmazenado = async (): Promise<Usuario | null> => {
  const usuarioString = await AsyncStorage.getItem(CHAVE_USUARIO);
  if (!usuarioString) return null;
  return JSON.parse(usuarioString);
};

/**
 * Valida token e retorna dados do usuário
 */
export const validarToken = async (): Promise<Usuario> => {
  // Verifica se há sessão ativa
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('Sessão inválida ou expirada');
  }

  // Busca dados do usuário
  return await buscarDadosUsuario(session.user.id);
};

/**
 * Verifica se usuário tem perfil específico
 */
export const temPerfil = (usuario: Usuario | null, perfil: string | string[]): boolean => {
  if (!usuario) return false;
  
  const perfis = Array.isArray(perfil) ? perfil : [perfil];
  return perfis.includes(usuario.perfil.nome_perfil);
};

/**
 * Verifica se usuário é Admin
 */
export const ehAdmin = (usuario: Usuario | null): boolean => {
  return temPerfil(usuario, 'Administrador');
};

/**
 * Verifica se usuário é Dono
 */
export const ehDono = (usuario: Usuario | null): boolean => {
  return temPerfil(usuario, 'Dono');
};

/**
 * Verifica se usuário é Cliente
 */
export const ehCliente = (usuario: Usuario | null): boolean => {
  return temPerfil(usuario, 'Cliente');
};

/**
 * Verifica se usuário pode gerenciar (Admin ou Dono)
 */
export const podeGerenciar = (usuario: Usuario | null): boolean => {
  return temPerfil(usuario, ['Administrador', 'Dono']);
};


