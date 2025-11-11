import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { API_URL } from '../../constants/api';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import { Produto, Categoria } from '../../types';

// Componentes
import CategoryList from '../../components/CategoryList';
import HomeHeader from '../../components/HomeHeader';
import SearchBar from '../../components/SearchBar';
import ItemCard from '../../components/ItemCard';

const HomeScreen = () => {
  const { adicionarAoCarrinho } = useCarrinho();

  const [products, setProducts] = useState<Produto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Produto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
      ]);

      if (!productsResponse.ok || !categoriesResponse.ok) {
        throw new Error('Falha ao buscar dados da API');
      }

      const productsData = await productsResponse.json();
      const categoriesData = await categoriesResponse.json();

      setProducts(productsData);
      setCategories(categoriesData);
      setFilteredProducts(productsData);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Um erro desconhecido ocorreu.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category.id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (product: Produto) => {
    adicionarAoCarrinho(product, 1);
    Alert.alert('Sucesso', `${product.name} adicionado ao carrinho!`);
  };

  const renderItem = ({ item }: { item: Produto }) => (
    // Wrapper para controlar layout responsivo na web
    Platform.OS === 'web' ? (
      <View style={styles.webCardWrapper}>
        <ItemCard item={item} onAddToCart={() => handleAddToCart(item)} />
      </View>
    ) : (
      <ItemCard item={item} onAddToCart={() => handleAddToCart(item)} />
    )
  );

  const renderListHeader = () => (
    <>
      <HomeHeader />
      <SearchBar onSearch={handleSearch} />
      <CategoryList 
        categories={categories} 
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? 'Itens Filtrados' : 'Todos os Itens'}
        </Text>
        {(searchQuery || selectedCategory) && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Limpar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Carregando cardápio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={80} color="#F44336" />
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        // RESPONSIVO: 2 colunas no mobile, layout flexível na web
        numColumns={Platform.OS === 'web' ? undefined : 2}
        key={Platform.OS === 'web' ? 'web' : 'mobile'}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        )}
        contentContainerStyle={[
          styles.listContainer,
          Platform.OS === 'web' && styles.webListContainer
        ]}
        columnWrapperStyle={Platform.OS === 'web' ? undefined : styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchData}
        refreshing={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  // Layout responsivo para WEB
  webListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  // Espaçamento entre colunas no mobile
  columnWrapper: {
    justifyContent: 'space-between',
  },
  // Wrapper para cada card na web
  webCardWrapper: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default HomeScreen;