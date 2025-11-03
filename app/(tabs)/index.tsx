import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text, // Para mostrar "Carregando..."
  View,
} from 'react-native';

// 1. Importe a URL da API
import { API_URL } from '../../constants/api';

// 2. Importe os Componentes
import CategoryList from '../../components/CategoryList';
import HomeHeader from '../../components/HomeHeader';
import ItemCard from '../../components/ItemCard';
import SearchBar from '../../components/SearchBar';

// 3. Defina os Tipos de dados que vêm da API
type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: string; // Nosso backend definiu como 'decimal', mas o JSON o trata como string
  imageUrl: string;
  category: Category; // A API nos manda o objeto Categoria aninhado
  rating: string;
};

// Componente para renderizar o cabeçalho completo da lista
// Agora ele recebe as categorias do estado
const renderListHeader = (categories: Category[]) => (
  <>
    <HomeHeader />
    <SearchBar />
    <CategoryList categories={categories} />
    <Text style={styles.sectionTitle}>Itens</Text>
  </>
);

const HomeScreen = () => {
  // 4. Crie os Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 5. Crie a função para buscar os dados
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Busca produtos e categorias ao mesmo tempo
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

  // 6. Use o useEffect para chamar a função quando a tela carregar
  useEffect(() => {
    fetchData();
  }, []); // O array vazio [] faz isso rodar apenas uma vez

  // 7. Renderize o item da FlatList
  const renderItem = ({ item }: { item: Product }) => <ItemCard item={item} />;

  // 8. Crie telas de "Loading" e "Erro"
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
        <Text style={styles.errorText}>Erro ao carregar dados:</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 9. Renderize o conteúdo principal
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={products} // Use o estado 'products'
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={() => renderListHeader(categories)} // Passe o estado 'categories'
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Adicione um "pull-to-refresh" (puxar para atualizar)
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  // Estilos para Loading e Erro
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 10,
  },
});

export default HomeScreen;