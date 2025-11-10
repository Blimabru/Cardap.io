/**
 * Types TypeScript para o sistema Cardap.io
 * 
 * Todos os tipos devem estar em português brasileiro
 */

// ============================================
// PERFIS E USUÁRIOS
// ============================================

export interface Perfil {
  id: string;
  nome_perfil: 'Administrador' | 'Dono' | 'Cliente';
  descricao: string;
  permissoes: Record<string, any>;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Usuario {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  foto_perfil_url?: string;
  ativo: boolean;
  email_verificado: boolean;
  perfil: Perfil;
  data_criacao: string;
  data_atualizacao: string;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosRegistro {
  nome_completo: string;
  email: string;
  senha: string;
  telefone?: string;
  foto_perfil_url?: string;
}

export interface RespostaAutenticacao {
  usuario: Usuario;
  token: string;
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
  usuario: Usuario;
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


