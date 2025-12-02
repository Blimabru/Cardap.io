/**
 * ============================================================================
 * CATEGORYLIST.TSX - COMPONENTE DE LISTA DE CATEGORIAS
 * ============================================================================
 * 
 * Componente reutilizável que exibe uma lista horizontal de categorias de produtos.
 * 
 * FUNCIONALIDADES:
 * - Lista horizontal scrollável de categorias
 * - Botão "Todos" para remover filtro de categoria
 * - Destaque visual para categoria selecionada
 * - Callback quando categoria é selecionada
 * - Layout responsivo para diferentes tamanhos de tela
 * 
 * COMPORTAMENTO:
 * - ScrollView horizontal permite navegar entre categorias
 * - Categoria selecionada tem estilo diferente (fundo e texto)
 * - Ao clicar em "Todos", passa null para onSelectCategory
 * 
 * USO:
 * <CategoryList 
 *   categories={categorias} 
 *   selectedCategory={categoriaSelecionada}
 *   onSelectCategory={(id) => setCategoriaSelecionada(id)} 
 * />
 */

// Importação do React
import React from 'react';
// Importação de componentes do React Native
import {
  Platform, // Utilitário para detectar plataforma
  ScrollView, // Componente de scroll horizontal
  StyleSheet, // Utilitário para criar estilos otimizados
  Text, // Componente de texto
  TouchableOpacity, // Botão tocável com feedback visual
  useWindowDimensions, // Hook para obter dimensões da janela/tela
  View, // Container básico
} from 'react-native';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================
// Tipo que define a estrutura de uma categoria
type Category = {
  id: string; // Identificador único da categoria
  name: string; // Nome da categoria (ex: "Bebidas", "Pizzas")
};

// Props que o componente CategoryList aceita
type CategoryListProps = {
  categories: Category[]; // Array de categorias a serem exibidas
  selectedCategory?: string | null; // ID da categoria atualmente selecionada (null = nenhuma)
  onSelectCategory?: (categoryId: string | null) => void; // Callback executado quando categoria é selecionada
};

/**
 * Componente CategoryList - Lista horizontal de categorias
 * 
 * @param categories - Array de categorias para exibir
 * @param selectedCategory - ID da categoria selecionada (opcional)
 * @param onSelectCategory - Função callback quando categoria é selecionada (opcional)
 * @returns JSX.Element - Renderiza a lista horizontal de categorias
 */
const CategoryList = ({ categories, selectedCategory, onSelectCategory }: CategoryListProps) => {
  // ============================================================================
  // HOOKS E VARIÁVEIS RESPONSIVAS
  // ============================================================================
  // Obtém a largura da tela para cálculos responsivos
  const { width: screenWidth } = useWindowDimensions();
  
  // Variáveis responsivas - Breakpoints para diferentes tamanhos de tela
  // Telas pequenas: menor que 375px (ex: iPhone SE)
  const isSmallScreen = screenWidth < 375;
  // Telas médias: entre 375px e 412px (ex: iPhone 12/13)
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  // Telas grandes: 412px ou maior (ex: tablets, web)
  const isLargeScreen = screenWidth >= 412;
  
  // Tamanhos responsivos - totalmente responsivo
  const containerPadding = isSmallScreen 
    ? 12 
    : isMediumScreen 
    ? 15 
    : isLargeScreen
    ? 15
    : Math.min(15, screenWidth * 0.036); // Responsivo para telas maiores
  const buttonPaddingV = isSmallScreen 
    ? 6 
    : isMediumScreen 
    ? 7 
    : isLargeScreen
    ? 8
    : Math.min(8, screenWidth * 0.019); // Responsivo para telas maiores
  const buttonPaddingH = isSmallScreen 
    ? 12 
    : isMediumScreen 
    ? 14 
    : isLargeScreen
    ? 16
    : Math.min(16, screenWidth * 0.039); // Responsivo para telas maiores
  const fontSize = isSmallScreen 
    ? 12 
    : isMediumScreen 
    ? 13 
    : isLargeScreen
    ? 14
    : Math.min(14, screenWidth * 0.034); // Responsivo para telas maiores
  const marginRight = isSmallScreen 
    ? 8 
    : isMediumScreen 
    ? 9 
    : isLargeScreen
    ? 10
    : Math.min(10, screenWidth * 0.024); // Responsivo para telas maiores
  
  return (
    <View style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoryScroll, { width: '100%', maxWidth: '100%' }]}
        contentContainerStyle={[styles.categoryScrollContainer, { paddingHorizontal: containerPadding }]}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            !selectedCategory ? styles.categoryButtonActive : null,
            {
              paddingVertical: buttonPaddingV,
              paddingHorizontal: buttonPaddingH,
              marginRight,
            },
          ]}
          onPress={() => onSelectCategory && onSelectCategory(null)}>
          <Text
            style={[
              styles.categoryText,
              !selectedCategory ? styles.categoryTextActive : null,
              { fontSize },
            ]}>
            Todos
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id ? styles.categoryButtonActive : null,
              {
                paddingVertical: buttonPaddingV,
                paddingHorizontal: buttonPaddingH,
                marginRight,
              },
            ]}
            onPress={() => onSelectCategory && onSelectCategory(category.id)}>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id ? styles.categoryTextActive : null,
                { fontSize },
              ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryScroll: {
    paddingVertical: 10,
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#E95322',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.5)',
    marginBottom: 20
  },
  categoryScrollContainer: {
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: '#F3E9B5',
    borderRadius: 20,
    minWidth: 60,
  },
  categoryButtonActive: {
    backgroundColor: '#efb20dff',
  },
  categoryText: {
    fontWeight: '600',
    color: '#000000ff',
  },
  categoryTextActive: {
    color: '#000000ff',
  },
});

export default CategoryList;