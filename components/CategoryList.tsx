import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// Definindo o tipo das props
type Category = {
  id: string;
  name: string;
};

type CategoryListProps = {
  categories: Category[];
};

const CategoryList = ({ categories }: CategoryListProps) => (
  <View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryScrollContainer}>
      {categories.map((category, index) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            index === 0 ? styles.categoryButtonActive : null, // Destaca o primeiro
          ]}>
          <Text
            style={[
              styles.categoryText,
              index === 0 ? styles.categoryTextActive : null,
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
  },
  categoryScrollContainer: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#333333',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
});

export default CategoryList;