/**
 * ============================================================================
 * METRO.CONFIG.JS - CONFIGURAÇÃO DO METRO BUNDLER
 * ============================================================================
 * 
 * Metro é o bundler JavaScript usado pelo React Native para:
 * - Compilar e transformar código TypeScript/JavaScript
 * - Bundle de assets (imagens, fontes, etc.)
 * - Hot reload durante desenvolvimento
 * - Tree shaking e otimizações
 * 
 * CONFIGURAÇÕES IMPORTANTES:
 * - Ignora pasta do backend para evitar conflitos
 * - Define diretórios de node_modules
 * - Configura resolução de módulos
 * 
 * USO:
 * Este arquivo é usado automaticamente pelo Expo/React Native
 * Não precisa ser importado manualmente
 */

// Importa configuração padrão do Expo
const { getDefaultConfig } = require('expo/metro-config');
// Utilitário para trabalhar com caminhos de arquivo
const path = require('path');

// Obtém configuração base do Expo (já otimizada)
const config = getDefaultConfig(__dirname);

// Configura quais pastas o Metro deve monitorar para mudanças
config.watchFolders = [__dirname];

// Define lista de arquivos/pastas que devem ser ignorados
config.resolver.blockList = [
  // Ignora completamente a pasta do backend Node.js
  // Evita conflitos entre dependências frontend/backend
  // Regex: qualquer arquivo dentro de meu-cardapio-api/
  /meu-cardapio-api\/.*/,
];

// Especifica onde buscar node_modules
// Garante que use apenas dependências do frontend
config.resolver.nodeModulesPaths = [
  // Caminho absoluto para node_modules do projeto frontend
  path.resolve(__dirname, 'node_modules'),
];

// Exporta configuração para uso pelo Metro
module.exports = config;

