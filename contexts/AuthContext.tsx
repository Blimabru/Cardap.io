/**
 * ============================================================================
 * AUTHCONTEXT.TSX - CONTEXT DE AUTENTICAÇÃO (CORAÇÃO DO SISTEMA FRONTEND)
 * ============================================================================
 * 
 * Este é um dos arquivos MAIS IMPORTANTES do sistema!
 * 
 * RESPONSABILIDADES:
 * 1. Gerenciar estado do usuário autenticado (quem está logado)
 * 2. Persistir login (AsyncStorage - mantém usuário logado ao fechar app)
 * 3. Fornecer funções de login, registro e logout
 * 4. Validar token JWT ao iniciar app
 * 5. Verificar perfis (Admin, Dono, Cliente)
 * 6. Proteger rotas (usado em _layout.tsx)
 * 
 * COMO FUNCIONA:
 * - Envolve toda a aplicação (em app/_layout.tsx)
 * - Qualquer componente filho pode acessar via useAuth()
 * - Estado é compartilhado globalmente
 * - Mudanças refletem em tempo real em todos os componentes
 * 
 * FLUXO TÍPICO:
 * 1. App abre → useEffect carrega token do AsyncStorage
 * 2. Se token existe → Valida com backend
 * 3. Se válido → Define usuário, app mostra telas autenticadas
 * 4. Se inválido → Remove token, app mostra tela de login
 * 
 * USO EM COMPONENTES:
 * const { usuario, login, logout, ehAdmin } = useAuth();
 * 
 * if (ehAdmin) {
 *   // Mostra botão admin
 * }
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as autenticacaoService from '../services/autenticacao.service';
import { DadosLogin, DadosRegistro, Usuario } from '../types';

/**
 * ========================================================================
 * INTERFACE DO CONTEXT
 * ========================================================================
 * 
 * Define todos os dados e funções disponíveis via useAuth()
 */
interface AuthContextData {
  /**
   * Usuário autenticado (null se não logado)
   * 
   * Estrutura:
   * {
   *   id: "uuid",
   *   nome_completo: "João Silva",
   *   email: "joao@email.com",
   *   telefone: "(11) 98765-4321",
   *   ativo: true,
   *   perfil: {
   *     id: "uuid",
   *     nome_perfil: "Cliente"
   *   }
   * }
   */
  usuario: Usuario | null;
  
  /**
   * Estado de carregamento inicial
   * true = Ainda validando token do AsyncStorage
   * false = Já validou (pode ser autenticado ou não)
   * 
   * USO: Mostrar splash screen enquanto carrega
   */
  carregando: boolean;
  
  /**
   * Usuário está autenticado?
   * true = Usuário logado
   * false = Usuário não logado
   * 
   * Computado: !!usuario (se usuario existe, true, senão false)
   */
  autenticado: boolean;
  
  /**
   * Função para fazer login
   * 
   * @param dados - Email e senha
   * @throws Error se credenciais inválidas
   * 
   * Fluxo:
   * 1. Chama API POST /auth/login
   * 2. Recebe token JWT
   * 3. Salva token no AsyncStorage
   * 4. Define token para requisições futuras
   * 5. Atualiza estado usuario
   */
  login: (dados: DadosLogin) => Promise<void>;
  
  /**
   * Função para registrar novo usuário (perfil Cliente)
   * 
   * @param dados - Nome, email, senha, telefone
   * @throws Error se email já existe
   * 
   * Fluxo similar ao login (registra e loga automaticamente)
   */
  registro: (dados: DadosRegistro) => Promise<void>;
  
  /**
   * Função para fazer logout
   * 
   * Fluxo:
   * 1. Remove token do AsyncStorage
   * 2. Remove token do cliente API
   * 3. Limpa estado usuario (null)
   * 4. App redireciona para login (via _layout.tsx)
   */
  logout: () => Promise<void>;
  
  /**
   * Verificadores de perfil (computed properties)
   * Usam funções do autenticacao.service.ts
   */
  ehAdmin: boolean;     // usuario.perfil.nome_perfil === 'Administrador'
  ehDono: boolean;      // usuario.perfil.nome_perfil === 'Dono'
  ehCliente: boolean;   // usuario.perfil.nome_perfil === 'Cliente'
  podeGerenciar: boolean; // ehAdmin || ehDono
}

/**
 * Cria o Context
 * Inicializado com objeto vazio (será preenchido pelo Provider)
 */
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Props do Provider
 */
interface AuthProviderProps {
  children: ReactNode; // Componentes filhos (toda a aplicação)
}

/**
 * ========================================================================
 * PROVIDER DO CONTEXT
 * ========================================================================
 * 
 * Envolve toda a aplicação (em app/_layout.tsx)
 * Fornece estado e funções para todos os componentes filhos
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  /**
   * Estado do usuário autenticado
   * null = não logado
   * Usuario = logado
   */
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  
  /**
   * Estado de carregamento inicial
   * Usado para mostrar splash screen enquanto valida token
   */
  const [carregando, setCarregando] = useState(true);

  /**
   * ========================================================================
   * EFFECT: CARREGAR USUÁRIO AO INICIAR APP
   * ========================================================================
   * 
   * Executado UMA VEZ quando app abre
   * [] = array vazio significa "executar apenas no mount"
   * 
   * OBJETIVO:
   * - Verificar se há token salvo no AsyncStorage
   * - Se houver, validar com backend
   * - Se válido, logar usuário automaticamente
   * - Se inválido, remover token e mostrar login
   */
  useEffect(() => {
    carregarUsuarioArmazenado();
  }, []);

  /**
   * ========================================================================
   * FUNÇÃO: CARREGAR USUÁRIO ARMAZENADO
   * ========================================================================
   * 
   * Carrega token do AsyncStorage e valida com backend
   * 
   * FLUXO:
   * 1. Busca token no AsyncStorage
   * 2. Se não tem: carregando = false, mostra login
   * 3. Se tem: Define token no cliente API
   * 4. Faz requisição GET /auth/perfil
   * 5. Se sucesso: Define usuário, mostra telas autenticadas
   * 6. Se erro 401: Remove token, mostra login
   */
  const carregarUsuarioArmazenado = async () => {
    try {
      // Verifica se há sessão ativa no Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('ℹ️ Nenhuma sessão encontrada. Usuário navegando como visitante');
        // Não forçar logout - permitir navegação pública
        setCarregando(false);
        return;
      }

      console.log('🔑 Sessão encontrada no Supabase');
      
      // Valida sessão e busca dados do usuário
      console.log('🔄 Validando sessão e buscando dados do usuário...');
      const usuarioValidado = await autenticacaoService.validarToken();
      
      console.log('✅ Sessão válida! Usuário logado automaticamente');
      console.log('👤 Usuário:', usuarioValidado.nome_completo);
      
      // Atualiza estado (isso faz o app mostrar telas autenticadas)
      setUsuario(usuarioValidado);
    } catch (erro) {
      console.error('❌ Erro ao carregar usuário:', erro);
      console.log('ℹ️ Sessão inválida ou expirada. Permitindo navegação pública...');
      
      // Não forçar logout - apenas limpar estado local
      // Permite que usuário navegue como visitante
      setUsuario(null);
    } finally {
      // Sempre define carregando como false no final
      // Isso remove splash screen e mostra tela apropriada (login ou home)
      setCarregando(false);
    }
  };

  /**
   * ========================================================================
   * FUNÇÃO: LOGIN
   * ========================================================================
   * 
   * Autentica usuário com email e senha
   * 
   * @param dados - { email, senha }
   * @throws Error com mensagem se credenciais inválidas
   * 
   * FLUXO:
   * 1. Chama POST /auth/login no backend
   * 2. Backend valida credenciais
   * 3. Se válido: Retorna { token, usuario }
   * 4. Salva token no AsyncStorage
   * 5. Define token para requisições
   * 6. Atualiza estado usuario
   * 7. _layout.tsx detecta mudança e redireciona para home
   * 
   * USADO EM:
   * - app/(auth)/login.tsx
   * - Usuário digita email/senha e clica "Entrar"
   */
  const login = async (dados: DadosLogin) => {
    try {
      console.log('🔄 Iniciando login...');
      console.log('📧 Email:', dados.email);
      
      // Chama service que faz POST /auth/login
      // Se sucesso: retorna { token, usuario }
      // Se falha: lança erro com mensagem
      const resposta = await autenticacaoService.fazerLogin(dados);
      
      console.log('✅ Login bem-sucedido! Token recebido');
      console.log('👤 Usuário:', resposta.usuario.nome_completo);
      console.log('🎫 Perfil:', resposta.usuario.perfil.nome_perfil);
      
      // Service já salvou token no AsyncStorage
      // Apenas atualiza estado local
      setUsuario(resposta.usuario);
      
      // _layout.tsx está observando 'usuario' com useEffect
      // Quando usuario muda de null para objeto, redireciona para home
    } catch (erro) {
      console.error('❌ Erro no login:', erro);
      // Lança erro para componente tratar (mostrar mensagem ao usuário)
      throw erro;
    }
  };

  /**
   * ========================================================================
   * FUNÇÃO: REGISTRO
   * ========================================================================
   * 
   * Registra novo usuário como Cliente
   * 
   * @param dados - { nome_completo, email, telefone, senha }
   * @throws Error se email já existe
   * 
   * FLUXO:
   * Similar ao login:
   * 1. POST /auth/registro
   * 2. Backend cria usuário com perfil Cliente
   * 3. Gera token automaticamente
   * 4. Retorna { token, usuario }
   * 5. Salva token e define usuário
   * 6. Usuário já está logado! Redireciona para home
   * 
   * USADO EM:
   * - app/(auth)/registro.tsx
   * - Botão "Cadastre-se" na tela de login
   */
  const registro = async (dados: DadosRegistro) => {
    try {
      console.log('🔄 Iniciando registro...');
      console.log('📧 Email:', dados.email);
      
      const resposta = await autenticacaoService.fazerRegistro(dados);
      
      console.log('✅ Registro bem-sucedido!');
      console.log('👤 Novo usuário:', resposta.usuario.nome_completo);
      
      // Atualiza estado (usuário já logado após registro)
      setUsuario(resposta.usuario);
    } catch (erro) {
      console.error('❌ Erro no registro:', erro);
      throw erro;
    }
  };

  /**
   * ========================================================================
   * FUNÇÃO: LOGOUT
   * ========================================================================
   * 
   * Desloga usuário do sistema
   * 
   * FLUXO:
   * 1. Remove token do AsyncStorage
   * 2. Remove token do cliente API
   * 3. Limpa estado usuario (null)
   * 4. _layout.tsx detecta e redireciona para login
   * 
   * USADO EM:
   * - app/(tabs)/admin.tsx
   * - Botão vermelho de logout (ícone de porta/sair)
   * 
   * IMPORTANTE:
   * - Logout é APENAS no frontend (token é removido localmente)
   * - Backend não mantém "sessões" (JWT é stateless)
   * - Token continua válido se alguém tiver cópia
   * - Expiração do token é automática (definido em JWT_EXPIRES_IN)
   */
  const logout = async () => {
    console.log('🔄 Context: Iniciando logout...');
    try {
      // Service remove token do AsyncStorage e limpa cliente API
      await autenticacaoService.fazerLogout();
      
      console.log('✅ Context: Token removido do storage');
      
      // Limpa estado local (isso causa re-render)
      setUsuario(null);
      
      console.log('✅ Context: Usuário removido do estado');
      console.log('✅ Context: Logout completo!');
      
      // _layout.tsx detecta usuario = null e redireciona para /login
    } catch (erro) {
      console.error('❌ Context: Erro no logout:', erro);
      throw erro;
    }
  };

  /**
   * ========================================================================
   * VERIFICADORES DE PERFIL (COMPUTED PROPERTIES)
   * ========================================================================
   * 
   * Calculados automaticamente sempre que 'usuario' muda
   * 
   * USO EM COMPONENTES:
   * const { ehAdmin, podeGerenciar } = useAuth();
   * 
   * if (ehAdmin) {
   *   return <BotaoGerenciarUsuarios />;
   * }
   * 
   * if (podeGerenciar) {
   *   return <BotaoGerenciarProdutos />;
   * }
   */
  const ehAdmin = autenticacaoService.ehAdmin(usuario);     // true se perfil = "Administrador"
  const ehDono = autenticacaoService.ehDono(usuario);       // true se perfil = "Dono"
  const ehCliente = autenticacaoService.ehCliente(usuario); // true se perfil = "Cliente"
  const podeGerenciar = autenticacaoService.podeGerenciar(usuario); // true se Admin OU Dono

  /**
   * ========================================================================
   * PROVIDER VALUE
   * ========================================================================
   * 
   * Valores fornecidos para todos os componentes filhos via useAuth()
   */
  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        autenticado: !!usuario, // !! converte para boolean: null → false, objeto → true
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
 * ========================================================================
 * HOOK: useAuth
 * ========================================================================
 * 
 * Hook customizado para acessar o context de forma fácil
 * 
 * USO EM COMPONENTES:
 * 
 * ```tsx
 * import { useAuth } from '../contexts/AuthContext';
 * 
 * export default function MinhaT from '../contexts/AuthContext';
 * 
 * export default function MinhaTela() {
 *   const { usuario, login, logout, ehAdmin } = useAuth();
 *   
 *   if (!usuario) {
 *     return <Text>Não logado</Text>;
 *   }
 *   
 *   return (
 *     <View>
 *       <Text>Olá, {usuario.nome_completo}!</Text>
 *       {ehAdmin && <Button title="Admin Panel" />}
 *       <Button title="Sair" onPress={logout} />
 *     </View>
 *   );
 * }
 * ```
 * 
 * VALIDAÇÃO:
 * Se tentar usar fora do Provider, lança erro
 * (evita bugs de context undefined)
 */
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  
  // Validação: useAuth deve ser usado dentro de AuthProvider
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

/**
 * ============================================================================
 * ARQUITETURA: COMO TUDO SE CONECTA
 * ============================================================================
 * 
 * app/_layout.tsx (raiz):
 * <AuthProvider>  ← Define Context
 *   <CarrinhoProvider>
 *     <Stack />  ← Todas as telas
 *   </CarrinhoProvider>
 * </AuthProvider>
 * 
 * app/(tabs)/admin.tsx (tela):
 * const { ehAdmin, logout } = useAuth();  ← Consome Context
 * 
 * if (!ehAdmin) {
 *   return <Text>Sem permissão</Text>;
 * }
 * 
 * BENEFÍCIOS DO CONTEXT:
 * ✅ Estado global (não precisa passar props manualmente)
 * ✅ Re-render automático (componentes atualizam quando usuario muda)
 * ✅ Single source of truth (um único lugar gerencia autenticação)
 * ✅ Fácil de usar (useAuth() em qualquer componente)
 * ✅ Type-safe (TypeScript valida tudo)
 * 
 * ============================================================================
 * FLUXO COMPLETO: DO LOGIN ATÉ A TELA
 * ============================================================================
 * 
 * 1. USUÁRIO ABRE APP:
 *    → app/_layout.tsx renderiza
 *    → AuthProvider inicializa
 *    → useEffect carregarUsuarioArmazenado() executa
 *    → Busca token no AsyncStorage
 *    → Se tem: valida com backend → usuário = objeto
 *    → Se não tem: usuário = null
 *    → carregando = false
 *    → _layout.tsx detecta e redireciona apropriadamente
 * 
 * 2. USUÁRIO FAZI LOGIN:
 *    → app/(auth)/login.tsx
 *    → const { login } = useAuth()
 *    → login({ email, senha })
 *    → POST /auth/login
 *    → Retorna { token, usuario }
 *    → Service salva token
 *    → setUsuario(resposta.usuario)
 *    → usuario mudou de null para objeto
 *    → _layout.tsx detecta
 *    → router.replace('/(tabs)') → Vai para home
 * 
 * 3. USUÁRIO NAVEGA PELO APP:
 *    → Todas as telas podem usar useAuth()
 *    → const { usuario, ehAdmin } = useAuth()
 *    → Mostram dados do usuário
 *    → Verificam permissões
 *    → Fazem requisições com token automático
 * 
 * 4. USUÁRIO FAZ LOGOUT:
 *    → app/(tabs)/admin.tsx
 *    → const { logout } = useAuth()
 *    → logout()
 *    → Remove token do AsyncStorage
 *    → setUsuario(null)
 *    → usuario mudou de objeto para null
 *    → _layout.tsx detecta
 *    → router.replace('/login') → Vai para login
 */
