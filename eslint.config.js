/**
 * ============================================================================
 * ESLINT.CONFIG.JS - CONFIGURAÇÃO DO LINTER
 * ============================================================================
 * 
 * ESLint é uma ferramenta de análise estática que:
 * - Encontra e reporta problemas no código JavaScript/TypeScript
 * - Garante consistência de estilo de código
 * - Previne bugs comuns e más práticas
 * - Pode corrigir automaticamente alguns problemas
 * 
 * FUNCIONALIDADES:
 * - Usa configuração otimizada do Expo
 * - Suporte completo para React Native e TypeScript
 * - Ignora arquivos de build/dist
 * - Integração com VS Code para feedback em tempo real
 * 
 * USO:
 * - npm run lint (executa verificação)
 * - Integração automática no VS Code
 * - Verificação em pre-commit hooks
 * 
 * DOCUMENTAÇÃO: https://docs.expo.dev/guides/using-eslint/
 */

// Importa função para definir configuração ESLint
const { defineConfig } = require('eslint/config');
// Importa configuração padrão otimizada do Expo para React Native
const expoConfig = require('eslint-config-expo/flat');

// Exporta configuração combinada
module.exports = defineConfig([
  // Aplica todas as regras recomendadas do Expo
  // Inclui: React, React Native, TypeScript, Import/Export, etc.
  expoConfig,
  {
    // Define arquivos/pastas que devem ser ignorados pelo ESLint
    ignores: [
      'dist/*', // Pasta de build/distribuição (arquivos compilados)
    ],
  },
]);
