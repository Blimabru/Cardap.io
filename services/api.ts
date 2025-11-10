/**
 * Cliente API
 * 
 * Configuração central para todas as chamadas à API
 */

import { API_URL } from '../constants/api';

/**
 * Armazena o token JWT em memória
 */
let tokenAtual: string | null = null;

/**
 * Define o token JWT para ser usado nas requisições
 */
export const definirToken = (token: string | null) => {
  tokenAtual = token;
};

/**
 * Obtém o token JWT atual
 */
export const obterToken = (): string | null => {
  return tokenAtual;
};

/**
 * Configuração padrão para fetch
 */
const configuracaoPadrao = (metodo: string, dados?: any): RequestInit => {
  const config: RequestInit = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Adiciona token se existir
  if (tokenAtual) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${tokenAtual}`;
    console.log('🔐 Token sendo enviado:', tokenAtual.substring(0, 20) + '...');
  } else {
    console.warn('⚠️ Requisição sem token!');
  }

  // Adiciona corpo se for POST/PUT
  if (dados && (metodo === 'POST' || metodo === 'PUT' || metodo === 'PATCH')) {
    config.body = JSON.stringify(dados);
  }

  return config;
};

/**
 * Faz requisição GET
 */
export const get = async <T = any>(endpoint: string): Promise<T> => {
  const resposta = await fetch(`${API_URL}${endpoint}`, configuracaoPadrao('GET'));
  
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({ mensagem: 'Erro desconhecido' }));
    throw new Error(erro.mensagem || `Erro ${resposta.status}`);
  }
  
  return resposta.json();
};

/**
 * Faz requisição POST
 */
export const post = async <T = any>(endpoint: string, dados: any): Promise<T> => {
  const resposta = await fetch(`${API_URL}${endpoint}`, configuracaoPadrao('POST', dados));
  
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({ mensagem: 'Erro desconhecido' }));
    throw new Error(erro.mensagem || `Erro ${resposta.status}`);
  }
  
  return resposta.json();
};

/**
 * Faz requisição PUT
 */
export const put = async <T = any>(endpoint: string, dados: any): Promise<T> => {
  const resposta = await fetch(`${API_URL}${endpoint}`, configuracaoPadrao('PUT', dados));
  
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({ mensagem: 'Erro desconhecido' }));
    throw new Error(erro.mensagem || `Erro ${resposta.status}`);
  }
  
  return resposta.json();
};

/**
 * Faz requisição DELETE
 */
export const del = async <T = any>(endpoint: string): Promise<T> => {
  const resposta = await fetch(`${API_URL}${endpoint}`, configuracaoPadrao('DELETE'));
  
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({ mensagem: 'Erro desconhecido' }));
    throw new Error(erro.mensagem || `Erro ${resposta.status}`);
  }
  
  return resposta.json();
};


