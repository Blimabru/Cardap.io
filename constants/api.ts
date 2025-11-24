/**
 * ============================================================================
 * API.TS - CONFIGURAÇÕES DA API
 * ============================================================================
 * 
 * Configurações do Supabase para uso na aplicação.
 * 
 * NOTA: O backend NestJS foi removido. Agora usamos Supabase diretamente.
 */

// Variáveis de ambiente do Supabase
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cxisgfykkemcbqymtses.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aXNnZnlra2VtY2JxeW10c2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTIzNTgsImV4cCI6MjA3OTU2ODM1OH0.oZPTCd0ot9wT06qB3mUZYLD1juvn-AAsSMBVp0CJEXo';

// Mantido para compatibilidade (não será mais usado)
export const API_URL = 'http://localhost:3000';