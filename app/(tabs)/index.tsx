import React from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform,
  Text,
} from 'react-native';

// Importar Dados
// Usamos '../../' para "subir" dois níveis de pasta (de app/(tabs) para a raiz)
import { categories, items } from '../../data/mockdata';

// Importar Componentes
import HomeHeader from '../../components/HomeHeader';
import SearchBar from '../../components/SearchBar';
import CategoryList from '../../components/CategoryList';
import ItemCard from '../../components/ItemCard';

// Componente para renderizar o cabeçalho completo da lista
const renderListHeader = () => (
  <>
    <HomeHeader />
    <SearchBar />
    <CategoryList categories={categories} />
    <Text style={styles.sectionTitle}>Itens</Text>
  </>
);

// Definindo os tipos para a FlatList
type Item = {
  id: string;
  name: string;
  price: string;
  rating: string;
  imageUrl: string;
};

const HomeScreen = () => {
  // Função para renderizar cada item
  const renderItem = ({ item }: { item: Item }) => <ItemCard item={item} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // Define o grid de 2 colunas
        ListHeaderComponent={renderListHeader} // Adiciona todo o cabeçalho
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // O SafeAreaView já é tratado pelo Expo Router, mas podemos manter para garantir
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  listContainer: {
    paddingHorizontal: 10, // Controla o padding lateral da lista inteira
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15, // Alinhado com os outros componentes
    paddingBottom: 10,
  },
});

export default HomeScreen;