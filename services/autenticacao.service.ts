/**
 * Service de Autenticação
 * 
 * Gerencia login, registro e validação de usuários
 */

import { get, post, definirToken } from './api';
import { DadosLogin, DadosRegistro, RespostaAutenticacao, Usuario } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_TOKEN = '@cardapio:token';
const CHAVE_USUARIO = '@cardapio:usuario';

/**
 * Faz login de usuário
 */
export const fazerLogin = async (dados: DadosLogin): Promise<RespostaAutenticacao> => {
  const resposta = await post<RespostaAutenticacao>('/auth/login', dados);
  
  // Salva token e usuário no AsyncStorage
  await AsyncStorage.setItem(CHAVE_TOKEN, resposta.token);
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
  
  // Define token para próximas requisições
  definirToken(resposta.token);
  
  return resposta;
};

/**
 * Faz registro de novo cliente
 */
export const fazerRegistro = async (dados: DadosRegistro): Promise<RespostaAutenticacao> => {
  const resposta = await post<RespostaAutenticacao>('/auth/registro', dados);
  
  // Salva token e usuário no AsyncStorage
  await AsyncStorage.setItem(CHAVE_TOKEN, resposta.token);
  await AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
  
  // Define token para próximas requisições
  definirToken(resposta.token);
  
  return resposta;
};

/**
 * Faz logout do usuário
 */
export const fazerLogout = async (): Promise<void> => {
  console.log('🔄 Service: Iniciando logout...');
  console.log('🗑️ Removendo token do AsyncStorage...');
  await AsyncStorage.removeItem(CHAVE_TOKEN);
  console.log('🗑️ Removendo usuário do AsyncStorage...');
  await AsyncStorage.removeItem(CHAVE_USUARIO);
  console.log('🔐 Removendo token da memória...');
  definirToken(null);
  console.log('✅ Service: Logout completo!');
};

/**
 * Obtém token armazenado
 */
export const obterTokenArmazenado = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(CHAVE_TOKEN);
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
  return await get<Usuario>('/auth/perfil');
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


