/**
 * ============================================================================
 * SEARCHBAR.TSX - COMPONENTE DE BUSCA DO CARDÁPIO
 * ============================================================================
 * 
 * Componente reutilizável para busca de produtos no cardápio.
 * 
 * FUNCIONALIDADES:
 * - Campo de texto para digitação
 * - Ícone de busca (lupa)
 * - Botão X para limpar busca
 * - Callback em tempo real conforme digita
 * 
 * USO:
 * <SearchBar onSearch={(texto) => filtrarProdutos(texto)} />
 * 
 * CARACTERÍSTICAS:
 * - Controlled component (valor controlado por estado)
 * - Debounce automático através do callback
 * - Design responsivo e acessível
 */

import React, { useState } from 'react';
// Componentes básicos do React Native
import { Platform, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
// Ícones Material Design do Expo
import { MaterialIcons as Icon } from '@expo/vector-icons';

// Props que o componente aceita
interface SearchBarProps {
  // Função callback executada a cada mudança no texto
  // Permite ao componente pai reagir à busca em tempo real
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  // Dimensões da tela para responsividade
  const { width: screenWidth } = useWindowDimensions();
  // Estado local para controlar o texto digitado
  const [searchText, setSearchText] = useState('');
  
  // Variáveis responsivas - totalmente responsivo
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412; // Telas grandes
  const isWeb = Platform.OS === 'web';
  
  // Tamanhos responsivos - totalmente responsivo
  const containerPadding = isSmallScreen 
    ? 12 
    : isMediumScreen 
    ? 15 
    : isLargeScreen
    ? 15
    : Math.min(15, screenWidth * 0.036); // Responsivo para telas maiores
  const inputPadding = isSmallScreen 
    ? 10 
    : isMediumScreen 
    ? 11 
    : isLargeScreen
    ? 12
    : Math.min(12, screenWidth * 0.029); // Responsivo para telas maiores
  const fontSize = isSmallScreen 
    ? 14 
    : isMediumScreen 
    ? 15 
    : isLargeScreen
    ? 16
    : Math.min(16, screenWidth * 0.039); // Responsivo para telas maiores
  const iconSize = isSmallScreen 
    ? 20 
    : isMediumScreen 
    ? 21 
    : isLargeScreen
    ? 22
    : Math.min(22, screenWidth * 0.053); // Responsivo para telas maiores

  // Função executada a cada mudança no input
  const handleTextChange = (text: string) => {
    // Atualiza estado local com novo texto
    setSearchText(text);
    
    // Se há callback definido, chama com o novo texto
    // Isso permite busca em tempo real enquanto digita
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    // Container principal com espaçamento
    <View style={[styles.searchContainer, { 
      paddingHorizontal: containerPadding,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    }]}>
      {/* Container do input com ícones */}
      <View style={[styles.searchInputContainer, { width: '100%', maxWidth: '100%' }]}>
        {/* Ícone de lupa à esquerda */}
        <Icon name="search" size={iconSize} color="#888" style={styles.searchIcon} />
        
        {/* Campo de texto principal */}
        <TextInput
          placeholder="Buscar no cardápio..."
          style={[styles.searchInput, { fontSize, paddingVertical: inputPadding }]}
          placeholderTextColor="#888" // Cor do placeholder
          value={searchText} // Controlled component
          onChangeText={handleTextChange} // Callback para mudanças
        />
        
        {/* Botão X para limpar (só aparece se há texto) */}
        {searchText.length > 0 && (
          <Icon 
            name="close" 
            size={isSmallScreen ? 18 : 20} 
            color="#888" 
            style={styles.clearIcon}
            // Limpa o campo ao tocar no X
            onPress={() => handleTextChange('')}
          />
        )}
      </View>
    </View>
  );
};

// Estilos do componente usando StyleSheet para otimização
const styles = StyleSheet.create({
  // Container principal do componente
  searchContainer: {
    paddingVertical: 10, // Espaçamento vertical (10px cima/baixo)
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#E95322'
  },
  // Container do input que engloba ícones e campo de texto
  searchInputContainer: {
    flexDirection: 'row', // Organiza filhos horizontalmente (ícone-input-ícone)
    backgroundColor: '#F5F5F5', // Fundo cinza claro
    borderRadius: 12, // Bordas arredondadas
    alignItems: 'center', // Centraliza verticalmente os elementos
    paddingRight: 12, // Espaço para o ícone de fechar
    width: '100%',
    maxWidth: '100%',
  },
  // Estilo do ícone de busca (lupa)
  searchIcon: {
    paddingLeft: 15, // Espaçamento à esquerda do ícone
    flexShrink: 0, // Não encolher
  },
  // Estilo do campo de texto principal
  searchInput: {
    flex: 1, // Ocupa todo espaço disponível entre os ícones
    paddingHorizontal: 10, // Espaçamento interno horizontal
    color: '#333', // Cor do texto digitado
    minWidth: 0, // Permite que o texto encolha se necessário
  },
  // Estilo do ícone de limpar (X)
  clearIcon: {
    padding: 4, // Área de toque maior que o ícone
    flexShrink: 0, // Não encolher
  },
});

// Exporta como componente padrão para uso em outras telas
export default SearchBar;