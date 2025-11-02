import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

const SearchBar = () => (
  <View style={styles.searchContainer}>
    <View style={styles.searchInputContainer}>
      <Icon name="search" size={22} color="#888" style={styles.searchIcon} />
      <TextInput
        placeholder="Buscar no cardápio..."
        style={styles.searchInput}
        placeholderTextColor="#888"
      />
    </View>
    <TouchableOpacity style={styles.filterButton}>
      <Icon name="filter-list" size={24} color="#333" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  searchIcon: {
    paddingLeft: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;