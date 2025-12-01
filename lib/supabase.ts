/**
 * ============================================================================
 * SUPABASE.TS - CLIENTE SUPABASE CONFIGURADO
 * ============================================================================
 * 
 * Este arquivo configura e exporta clientes Supabase para uso em toda a aplicação.
 * 
 * FUNCIONALIDADES:
 * - Cliente principal autenticado (supabase)
 * - Cliente anônimo para pedidos via QR (supabaseAnon)
 * - Configurações de autenticação e persistência de sessão
 * 
 * USO:
 * import { supabase } from '../lib/supabase';
 * const { data } = await supabase.from('produtos').select('*');
 * 
 * IMPORTANTE:
 * - Use este cliente único em todos os services
 * - Não crie múltiplas instâncias do Supabase
 * - As variáveis de ambiente devem estar configuradas
 */

// Importa função para criar cliente Supabase
import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente do projeto Supabase
// EXPO_PUBLIC_ permite acesso no frontend (variáveis públicas)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cxisgfykkemcbqymtses.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aXNnZnlra2VtY2JxeW10c2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTIzNTgsImV4cCI6MjA3OTU2ODM1OH0.oZPTCd0ot9wT06qB3mUZYLD1juvn-AAsSMBVp0CJEXo';

// Validação: falha rapidamente se variáveis não estão configuradas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas!');
}

/**
 * Cliente Supabase principal para uso no frontend
 * 
 * Este cliente usa a chave anônima (pública) e respeita as políticas RLS (Row Level Security).
 * Ideal para operações que dependem do usuário autenticado.
 * 
 * CARACTERÍSTICAS:
 * - Renova tokens automaticamente quando expiram
 * - Persiste sessão de usuário no AsyncStorage
 * - Não detecta sessões via URL (mobile app)
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Renova automaticamente tokens JWT quando próximos do vencimento
    autoRefreshToken: true,
    // Persiste sessão do usuário entre fechamentos do app
    persistSession: true,
    // Não tenta detectar sessão na URL (não é web app)
    detectSessionInUrl: false,
  },
});

/**
 * Cliente Supabase para requisições anônimas (sem sessão de usuário)
 * 
 * Use este cliente quando precisar fazer operações sem autenticação,
 * como criar pedidos de mesa via QR code onde não há usuário logado.
 * 
 * CARACTERÍSTICAS:
 * - Não persiste sessão de usuário
 * - Não renova tokens automaticamente
 * - Ideal para operações públicas/anônimas
 * - Otimizado para mobile (sem interferência de storage)
 * 
 * IMPORTANTE: 
 * - Este client não persiste sessão e não tenta usar tokens existentes
 * - Sempre usa role 'anon' (nunca tenta autenticar)
 * - Ideal para pedidos de mesa via QR code no mobile
 */
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Não salva sessão do usuário (crítico para mobile)
    persistSession: false,
    // Não renova tokens (operações pontuais)
    autoRefreshToken: false,
    // Não detecta sessão na URL (mobile app)
    detectSessionInUrl: false,
    // Não usar storage para evitar sessões persistentes no mobile
    storage: undefined,
    // Garantir que não tenta usar storage do AsyncStorage
    storageKey: undefined,
  },
  // Garantir que não há headers de autenticação
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
    },
  },
});

/**
 * Tipos do banco de dados (gerados automaticamente pelo Supabase CLI)
 * Por enquanto, usamos tipos genéricos
 */
export type Database = {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string;
          nome_perfil: string;
          descricao: string | null;
          permissoes: Record<string, any>;
          ativo: boolean;
          data_criacao: string;
          data_atualizacao: string;
        };
        Insert: {
          id?: string;
          nome_perfil: string;
          descricao?: string | null;
          permissoes?: Record<string, any>;
          ativo?: boolean;
          data_criacao?: string;
          data_atualizacao?: string;
        };
        Update: {
          id?: string;
          nome_perfil?: string;
          descricao?: string | null;
          permissoes?: Record<string, any>;
          ativo?: boolean;
          data_criacao?: string;
          data_atualizacao?: string;
        };
      };
      usuarios: {
        Row: {
          id: string;
          nome_completo: string;
          email: string;
          telefone: string | null;
          foto_perfil_url: string | null;
          id_perfil: string;
          ativo: boolean;
          email_verificado: boolean;
          data_criacao: string;
          data_atualizacao: string;
        };
        Insert: {
          id?: string;
          nome_completo: string;
          email: string;
          telefone?: string | null;
          foto_perfil_url?: string | null;
          id_perfil: string;
          ativo?: boolean;
          email_verificado?: boolean;
          data_criacao?: string;
          data_atualizacao?: string;
        };
        Update: {
          id?: string;
          nome_completo?: string;
          email?: string;
          telefone?: string | null;
          foto_perfil_url?: string | null;
          id_perfil?: string;
          ativo?: boolean;
          email_verificado?: boolean;
          data_criacao?: string;
          data_atualizacao?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          data_criacao: string;
          data_atualizacao: string;
        };
        Insert: {
          id?: string;
          name: string;
          data_criacao?: string;
          data_atualizacao?: string;
        };
        Update: {
          id?: string;
          name?: string;
          data_criacao?: string;
          data_atualizacao?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          imageUrl: string;
          rating: number;
          categoryId: string;
          data_criacao: string;
          data_atualizacao: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          imageUrl: string;
          rating?: number;
          categoryId: string;
          data_criacao?: string;
          data_atualizacao?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          imageUrl?: string;
          rating?: number;
          categoryId?: string;
          data_criacao?: string;
          data_atualizacao?: string;
        };
      };
      pedidos: {
        Row: {
          id: string;
          numero_pedido: number;
          id_usuario: string;
          status: string;
          tipo_pedido: string;
          subtotal: number;
          taxa_entrega: number;
          taxa_servico: number;
          total: number;
          observacoes: string | null;
          endereco_entrega: string | null;
          data_criacao: string;
          data_atualizacao: string;
        };
        Insert: {
          id?: string;
          numero_pedido?: number;
          id_usuario: string;
          status?: string;
          tipo_pedido?: string;
          subtotal?: number;
          taxa_entrega?: number;
          taxa_servico?: number;
          total: number;
          observacoes?: string | null;
          endereco_entrega?: string | null;
          data_criacao?: string;
          data_atualizacao?: string;
        };
        Update: {
          id?: string;
          numero_pedido?: number;
          id_usuario?: string;
          status?: string;
          tipo_pedido?: string;
          subtotal?: number;
          taxa_entrega?: number;
          taxa_servico?: number;
          total?: number;
          observacoes?: string | null;
          endereco_entrega?: string | null;
          data_criacao?: string;
          data_atualizacao?: string;
        };
      };
      itens_pedido: {
        Row: {
          id: string;
          id_pedido: string;
          id_produto: string;
          quantidade: number;
          preco_unitario: number;
          subtotal: number;
          observacoes: string | null;
        };
        Insert: {
          id?: string;
          id_pedido: string;
          id_produto: string;
          quantidade?: number;
          preco_unitario: number;
          subtotal: number;
          observacoes?: string | null;
        };
        Update: {
          id?: string;
          id_pedido?: string;
          id_produto?: string;
          quantidade?: number;
          preco_unitario?: number;
          subtotal?: number;
          observacoes?: string | null;
        };
      };
    };
  };
};


