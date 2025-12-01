/**
 * ============================================================================
 * API.TS - CLIENTE API (DEPRECADO - MIGRADO PARA SUPABASE)
 * ============================================================================
 * 
 * Este arquivo foi mantido apenas para compatibilidade.
 * 
 * IMPORTANTE:
 * - Todas as funcionalidades foram migradas para Supabase
 * - Use os services diretamente (produtos.service.ts, etc.)
 * - Este arquivo será removido em versões futuras
 * 
 * MIGRAÇÃO:
 * - Antes: get('/products') → Agora: listarProdutos() do produtos.service.ts
 * - Antes: post('/auth/login') → Agora: fazerLogin() do autenticacao.service.ts
 * - etc.
 */

/**
 * Funções mantidas apenas para compatibilidade
 * NÃO USE ESTAS FUNÇÕES - Use os services diretamente
 */

export const definirToken = (token: string | null) => {
  console.warn('⚠️ definirToken() está deprecado. Use Supabase Auth diretamente.');
  // Não faz nada - Supabase gerencia tokens automaticamente
};

export const obterToken = (): string | null => {
  console.warn('⚠️ obterToken() está deprecado. Use supabase.auth.getSession() diretamente.');
  return null;
};

// Funções HTTP removidas - use Supabase diretamente
export const get = async <T = any>(endpoint: string): Promise<T> => {
  throw new Error(`get() está deprecado. Use Supabase diretamente. Endpoint: ${endpoint}`);
};

export const post = async <T = any>(endpoint: string, dados?: any): Promise<T> => {
  throw new Error(`post() está deprecado. Use Supabase diretamente. Endpoint: ${endpoint}`);
};

export const put = async <T = any>(endpoint: string, dados?: any): Promise<T> => {
  throw new Error(`put() está deprecado. Use Supabase diretamente. Endpoint: ${endpoint}`);
};

export const del = async <T = any>(endpoint: string): Promise<T> => {
  throw new Error(`del() está deprecado. Use Supabase diretamente. Endpoint: ${endpoint}`);
};


