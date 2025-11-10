/**
 * Configuração do Metro Bundler
 * 
 * Ignora pasta do backend para evitar conflitos
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ignora pasta do backend (meu-cardapio-api)
config.watchFolders = [__dirname];
config.resolver.blockList = [
  // Ignora completamente a pasta do backend
  /meu-cardapio-api\/.*/,
];

// Ignora node_modules do backend também
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;

