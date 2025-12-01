import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

const CategoryList = ({ categories, selectedCategory, onSelectCategory }: CategoryListProps) => (
  <View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryScrollContainer}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          !selectedCategory ? styles.categoryButtonActive : null,
        ]}
        onPress={() => onSelectCategory && onSelectCategory(null)}>
        <Text
          style={[
            styles.categoryText,
            !selectedCategory ? styles.categoryTextActive : null,
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
          ]}
          onPress={() => onSelectCategory && onSelectCategory(category.id)}>
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id ? styles.categoryTextActive : null,
            ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  categoryScroll: {
    paddingVertical: 10,
    width: '100%',
    maxWidth: '100%',
  },
  categoryScrollContainer: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: '#F3E9B5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    minWidth: 60,
  },
  categoryButtonActive: {
    backgroundColor: '#efb20dff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000ff',
  },
  categoryTextActive: {
    color: '#000000ff',
  },
});

export default CategoryList;