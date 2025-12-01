/**
 * ============================================================================
 * TYPES/INDEX.TS - DEFINIÇÕES DE TIPOS TYPESCRIPT
 * ============================================================================
 * 
 * Este arquivo centraliza todas as definições de tipos TypeScript do projeto.
 * 
 * PRINCÍPIOS:
 * - Todos os nomes em português brasileiro (nome_completo, não fullName)
 * - Interfaces refletem exatamente as tabelas do Supabase
 * - Tipos reutilizáveis e bem documentados
 * - Organização por domínio (usuários, produtos, pedidos, etc.)
 * 
 * USO:
 * import { Usuario, Produto, Pedido } from '../types';
 * const usuario: Usuario = { ... };
 * 
 * CONVENÇÕES:
 * - Interfaces para objetos de dados (Usuario, Produto)
 * - Types para união de strings ('Ativo' | 'Inativo')
 * - Sufixo "Dados" para input de forms (DadosLogin, DadosRegistro)
 * - Sufixo "Resposta" para responses de API (RespostaAutenticacao)
 */

// ============================================
// PERFIS E USUÁRIOS
// ============================================

/**
 * Interface representando um perfil de usuário no sistema
 * 
 * TABELA: perfis
 * DESCRIÇÃO: Define os tipos de usuário e suas permissões
 */
export interface Perfil {
  // Identificador único do perfil (UUID)
  id: string;
  // Nome do perfil: Administrador (acesso total), Dono (gerencia restaurant), Cliente (fazer pedidos)
  nome_perfil: 'Administrador' | 'Dono' | 'Cliente';
  // Descrição textual do que o perfil pode fazer
  descricao: string;
  // Objeto JSON com permissões específicas do perfil
  permissoes: Record<string, any>;
  // Se o perfil está ativo e pode ser atribuído a usuários
  ativo: boolean;
  // Timestamp de quando o perfil foi criado
  data_criacao: string;
  // Timestamp da última atualização do perfil
  data_atualizacao: string;
}

/**
 * Interface representando um usuário do sistema
 * 
 * TABELA: usuarios
 * DESCRIÇÃO: Dados completos de um usuário cadastrado
 */
export interface Usuario {
  // Identificador único do usuário (UUID)
  id: string;
  // Nome completo do usuário (ex: "João Silva")
  nome_completo: string;
  // Email único para login e identificação
  email: string;
  // Telefone opcional para contato
  telefone?: string;
  // URL da foto de perfil (opcional)
  foto_perfil_url?: string;
  // Se o usuário está ativo (pode fazer login)
  ativo: boolean;
  // Se o email foi verificado via confirmação
  email_verificado: boolean;
  // Perfil associado com permissões
  perfil: Perfil;
  // Timestamp de cadastro do usuário
  data_criacao: string;
  // Timestamp da última atualização dos dados
  data_atualizacao: string;
}

/**
 * Dados necessários para fazer login
 * 
 * USO: Formulários de login
 */
export interface DadosLogin {
  // Email do usuário cadastrado
  email: string;
  // Senha para autenticação
  senha: string;
}

/**
 * Dados necessários para registrar novo usuário
 * 
 * USO: Formulários de cadastro/registro
 */
export interface DadosRegistro {
  // Nome completo obrigatório
  nome_completo: string;
  // Email único no sistema
  email: string;
  // Senha com critérios mínimos de segurança
  senha: string;
  // Telefone opcional
  telefone?: string;
  // URL da foto opcional
  foto_perfil_url?: string;
}

/**
 * Resposta da API após autenticação bem-sucedida
 * 
 * USO: Retorno dos services de login/registro
 */
export interface RespostaAutenticacao {
  // Dados completos do usuário autenticado
  usuario: Usuario;
  // Token JWT para requisições autenticadas
  token: string;
  // Tipo do token (sempre Bearer para JWT)
  tipo_token: 'Bearer';
}

// ============================================
// CATEGORIAS E PRODUTOS
// ============================================

export interface Categoria {
  id: string;
  name: string; // Mantém 'name' para compatibilidade com backend atual
}

export interface Produto {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  imageUrl: string;
  rating: string | number;
  category: Categoria;
}

// ============================================
// PEDIDOS
// ============================================

export enum StatusPedido {
  PENDENTE = 'pendente',
  CONFIRMADO = 'confirmado',
  EM_PREPARO = 'em_preparo',
  PRONTO = 'pronto',
  SAIU_ENTREGA = 'saiu_entrega',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado'
}

export enum TipoPedido {
  LOCAL = 'local',
  DELIVERY = 'delivery',
  RETIRADA = 'retirada'
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacoes?: string;
}

export interface ItemPedido {
  id: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  observacoes?: string;
  produto: Produto;
}

export interface Pedido {
  id: string;
  numero_pedido: number;
  status: StatusPedido;
  tipo_pedido: TipoPedido;
  subtotal: number;
  taxa_entrega: number;
  taxa_servico: number;
  total: number;
  observacoes?: string;
  endereco_entrega?: string;
  id_mesa?: string;
  status_pagamento?: StatusPagamento;
  usuario?: Usuario;
  mesa?: Mesa;
  itens: ItemPedido[];
  data_criacao: string;
  data_atualizacao: string;
}

export interface CriarPedidoDto {
  itens: Array<{
    id_produto: string;
    quantidade: number;
    observacoes?: string;
  }>;
  tipo_pedido: TipoPedido;
  observacoes?: string;
  endereco_entrega?: string;
  taxa_entrega?: number;
  id_mesa?: string;
}

// ============================================
// MESAS
// ============================================

export enum StatusMesa {
  LIVRE = 'livre',
  OCUPADA = 'ocupada',
  RESERVADA = 'reservada',
  INATIVA = 'inativa'
}

export interface Mesa {
  id: string;
  numero: number;
  qr_code: string;
  status: StatusMesa;
  capacidade: number;
  observacoes?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CriarMesaDto {
  numero: number;
  capacidade?: number;
  observacoes?: string;
}

export interface AtualizarMesaDto {
  status?: StatusMesa;
  capacidade?: number;
  observacoes?: string;
}

// ============================================
// CONTAS MESA
// ============================================

export enum StatusConta {
  ABERTA = 'aberta',
  FECHADA = 'fechada',
  PAGA = 'paga',
  CANCELADA = 'cancelada'
}

export enum StatusPagamento {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  CANCELADO = 'cancelado'
}

export enum FormaPagamento {
  DINHEIRO = 'dinheiro',
  CARTAO_DEBITO = 'cartao_debito',
  CARTAO_CREDITO = 'cartao_credito',
  PIX = 'pix'
}

export interface ContaMesa {
  id: string;
  id_mesa: string;
  status: StatusConta;
  total: number;
  forma_pagamento?: FormaPagamento;
  observacoes?: string;
  mesa?: Mesa;
  data_abertura: string;
  data_fechamento?: string;
  data_pagamento?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface FecharContaDto {
  id_mesa: string;
}

export interface FinalizarPagamentoDto {
  conta_id: string;
  forma_pagamento: FormaPagamento;
}

export interface Rendimento {
  id: string;
  id_conta_mesa: string;
  valor: number;
  forma_pagamento: FormaPagamento;
  observacoes?: string;
  data_pagamento: string;
  data_criacao: string;
  data_atualizacao: string;
  conta_mesa?: ContaMesa;
}

export interface RegistrarRendimentoDto {
  id_conta_mesa: string;
  valor: number;
  forma_pagamento: FormaPagamento;
  observacoes?: string;
}

// ============================================
// ESTATÍSTICAS (para dashboard)
// ============================================

export interface EstatisticasPedidos {
  total_pedidos: number;
  pendentes: number;
  em_preparo: number;
  finalizados: number;
  valor_total: number;
}

// ============================================
// RESPOSTA API
// ============================================

export interface RespostaApi<T = any> {
  data?: T;
  mensagem?: string;
  erro?: string;
}


