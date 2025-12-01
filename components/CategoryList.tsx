import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

// Definindo o tipo das props
type Category = {
  id: string;
  name: string;
};

type CategoryListProps = {
  categories: Category[];
  selectedCategory?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
};

const CategoryList = ({ categories, selectedCategory, onSelectCategory }: CategoryListProps) => {
  // Dimensões da tela para responsividade
  const { width: screenWidth } = useWindowDimensions();
  
  // Variáveis responsivas - totalmente responsivo
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
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
  },
  categoryScrollContainer: {
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    minWidth: 60,
  },
  categoryButtonActive: {
    backgroundColor: '#333333',
  },
  categoryText: {
    fontWeight: '600',
    color: '#555',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
});

export default CategoryList;