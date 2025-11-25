/**
 * ============================================================================
 * SUPABASE.TS - CLIENTE SUPABASE CONFIGURADO
 * ============================================================================
 * 
 * Cliente centralizado do Supabase para uso em toda a aplicação.
 * 
 * IMPORTANTE:
 * - Use este cliente em todos os services
 * - Não crie múltiplas instâncias
 * - As variáveis de ambiente devem estar configuradas
 */

import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente do Supabase
// Estas devem estar no .env ou configuradas no Expo Constants
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cxisgfykkemcbqymtses.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aXNnZnlra2VtY2JxeW10c2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTIzNTgsImV4cCI6MjA3OTU2ODM1OH0.oZPTCd0ot9wT06qB3mUZYLD1juvn-AAsSMBVp0CJEXo';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas!');
}

/**
 * Cliente Supabase para uso no frontend
 * 
 * Este cliente usa a chave anon (pública) e respeita as políticas RLS.
 * Para operações administrativas, use o cliente com service_role key.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Cliente Supabase para requisições anônimas (sem sessão)
 * 
 * Use este cliente quando precisar fazer requisições sem autenticação,
 * como criar pedidos de mesa via QR code.
 * 
 * IMPORTANTE: Este client não persiste sessão e não tenta usar tokens existentes.
 */
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: undefined, // Não usar storage para evitar sessões persistentes
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


