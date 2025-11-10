import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const handleTextChange = (text: string) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={22} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar no cardápio..."
          style={styles.searchInput}
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={handleTextChange}
        />
        {searchText.length > 0 && (
          <Icon 
            name="close" 
            size={20} 
            color="#888" 
            style={styles.clearIcon}
            onPress={() => handleTextChange('')}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    paddingRight: 12,
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
  clearIcon: {
    padding: 4,
  },
});

export default SearchBar;