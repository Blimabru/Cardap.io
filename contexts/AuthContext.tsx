/**
 * Context de Autenticação
 * 
 * Gerencia estado de autenticação do usuário em toda a aplicação
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Usuario, DadosLogin, DadosRegistro, RespostaAutenticacao } from '../types';
import * as autenticacaoService from '../services/autenticacao.service';
import { definirToken } from '../services/api';

interface AuthContextData {
  usuario: Usuario | null;
  carregando: boolean;
  autenticado: boolean;
  login: (dados: DadosLogin) => Promise<void>;
  registro: (dados: DadosRegistro) => Promise<void>;
  logout: () => Promise<void>;
  ehAdmin: boolean;
  ehDono: boolean;
  ehCliente: boolean;
  podeGerenciar: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  /**
   * Verifica se há token salvo e valida ao iniciar o app
   */
  useEffect(() => {
    carregarUsuarioArmazenado();
  }, []);

  const carregarUsuarioArmazenado = async () => {
    try {
      const token = await autenticacaoService.obterTokenArmazenado();
      
      if (token) {
        // Define token para requisições
        definirToken(token);
        
        // Valida token com o backend
        const usuarioValidado = await autenticacaoService.validarToken();
        setUsuario(usuarioValidado);
      }
    } catch (erro) {
      console.error('Erro ao carregar usuário:', erro);
      // Se token inválido, faz logout
      await logout();
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Faz login de usuário
   */
  const login = async (dados: DadosLogin) => {
    try {
      const resposta = await autenticacaoService.fazerLogin(dados);
      setUsuario(resposta.usuario);
    } catch (erro) {
      throw erro;
    }
  };

  /**
   * Faz registro de novo cliente
   */
  const registro = async (dados: DadosRegistro) => {
    try {
      const resposta = await autenticacaoService.fazerRegistro(dados);
      setUsuario(resposta.usuario);
    } catch (erro) {
      throw erro;
    }
  };

  /**
   * Faz logout do usuário
   */
  const logout = async () => {
    await autenticacaoService.fazerLogout();
    setUsuario(null);
  };

  // Propriedades computadas para verificação de perfil
  const ehAdmin = autenticacaoService.ehAdmin(usuario);
  const ehDono = autenticacaoService.ehDono(usuario);
  const ehCliente = autenticacaoService.ehCliente(usuario);
  const podeGerenciar = autenticacaoService.podeGerenciar(usuario);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        autenticado: !!usuario,
        login,
        registro,
        logout,
        ehAdmin,
        ehDono,
        ehCliente,
        podeGerenciar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};


