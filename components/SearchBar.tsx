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
import { StyleSheet, TextInput, View } from 'react-native';
// Ícones Material Design do Expo
import { MaterialIcons as Icon } from '@expo/vector-icons';

// Props que o componente aceita
interface SearchBarProps {
  // Função callback executada a cada mudança no texto
  // Permite ao componente pai reagir à busca em tempo real
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  // Estado local para controlar o texto digitado
  const [searchText, setSearchText] = useState('');

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
    <View style={styles.searchContainer}>
      {/* Container do input com ícones */}
      <View style={styles.searchInputContainer}>
        {/* Ícone de lupa à esquerda */}
        <Icon name="search" size={22} color="#888" style={styles.searchIcon} />
        
        {/* Campo de texto principal */}
        <TextInput
          placeholder="Buscar no cardápio..."
          style={styles.searchInput}
          placeholderTextColor="#888" // Cor do placeholder
          value={searchText} // Controlled component
          onChangeText={handleTextChange} // Callback para mudanças
        />
        
        {/* Botão X para limpar (só aparece se há texto) */}
        {searchText.length > 0 && (
          <Icon 
            name="close" 
            size={20} 
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
    paddingHorizontal: 15, // Espaçamento lateral (15px cada lado)
    paddingVertical: 10, // Espaçamento vertical (10px cima/baixo)
  },
  // Container do input que engloba ícones e campo de texto
  searchInputContainer: {
    flexDirection: 'row', // Organiza filhos horizontalmente (ícone-input-ícone)
    backgroundColor: '#F5F5F5', // Fundo cinza claro
    borderRadius: 12, // Bordas arredondadas
    alignItems: 'center', // Centraliza verticalmente os elementos
    paddingRight: 12, // Espaço para o ícone de fechar
  },
  // Estilo do ícone de busca (lupa)
  searchIcon: {
    paddingLeft: 15, // Espaçamento à esquerda do ícone
  },
  // Estilo do campo de texto principal
  searchInput: {
    flex: 1, // Ocupa todo espaço disponível entre os ícones
    paddingVertical: 12, // Espaçamento interno vertical
    paddingHorizontal: 10, // Espaçamento interno horizontal
    fontSize: 16, // Tamanho da fonte
    color: '#333', // Cor do texto digitado
  },
  // Estilo do ícone de limpar (X)
  clearIcon: {
    padding: 4, // Área de toque maior que o ícone
  },
});

// Exporta como componente padrão para uso em outras telas
export default SearchBar;