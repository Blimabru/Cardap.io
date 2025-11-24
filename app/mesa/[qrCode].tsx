/**
 * Tela de Cardápio Público via QR Code
 * 
 * Acesso público ao cardápio sem necessidade de login
 * Vinculado a uma mesa específica
 */

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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { MesaCarrinhoProvider, useMesaCarrinho } from '../../contexts/MesaCarrinhoContext';
import { Produto, Categoria, Mesa } from '../../types';
import * as produtosService from '../../services/produtos.service';
import * as categoriasService from '../../services/categorias.service';
import * as qrcodeService from '../../services/qrcode.service';
import * as pedidosService from '../../services/pedidos.service';
import { TipoPedido } from '../../types';

// Componentes
import CategoryList from '../../components/CategoryList';
import SearchBar from '../../components/SearchBar';
import ItemCard from '../../components/ItemCard';

function MesaCardapioContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrCode = params.qrCode as string;
  const { itens, mesa, idMesa, adicionarAoCarrinho, limparCarrinho, quantidadeTotal, definirMesa } = useMesaCarrinho();

  const [products, setProducts] = useState<Produto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Produto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [validandoQR, setValidandoQR] = useState(true);
  const [mesaValidada, setMesaValidada] = useState<Mesa | null>(null);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  useEffect(() => {
    if (qrCode) {
      validarEConfigurarMesa();
    }
  }, [qrCode]);

  useEffect(() => {
    if (mesaValidada) {
      fetchData();
    }
  }, [mesaValidada]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const validarEConfigurarMesa = async () => {
    try {
      setValidandoQR(true);
      const mesa = await qrcodeService.validarQRCode(qrCode);
      setMesaValidada(mesa);
      // Definir mesa no contexto
      definirMesa(mesa);
    } catch (erro: any) {
      setError(erro.message || 'QR code inválido');
      Alert.alert(
        'QR Code Inválido',
        'O QR code escaneado não é válido ou a mesa está inativa.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } finally {
      setValidandoQR(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        produtosService.listarProdutos(),
        categoriasService.listarCategorias(),
      ]);

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

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

  const handleFinalizarPedido = async () => {
    if (!idMesa || itens.length === 0) {
      Alert.alert('Atenção', 'Seu carrinho está vazio');
      return;
    }

    setEnviandoPedido(true);
    try {
      await pedidosService.criarPedido({
        itens: itens.map((item) => ({
          id_produto: item.produto.id,
          quantidade: item.quantidade,
          observacoes: item.observacoes,
        })),
        tipo_pedido: TipoPedido.LOCAL,
        id_mesa: idMesa,
      });

      limparCarrinho();

      Alert.alert(
        'Pedido Realizado!',
        'Seu pedido foi enviado com sucesso. Aguarde o atendimento.',
        [{ text: 'OK' }]
      );
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível finalizar o pedido');
    } finally {
      setEnviandoPedido(false);
    }
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <ItemCard item={item} onAddToCart={() => handleAddToCart(item)} />
  );

  const renderListHeader = () => (
    <>
      <View style={styles.mesaHeader}>
        <View>
          <Text style={styles.mesaTitle}>Mesa #{mesaValidada?.numero}</Text>
          <Text style={styles.mesaSubtitle}>Escaneie o QR code para acessar o cardápio</Text>
        </View>
      </View>
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

  if (validandoQR) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Validando QR code...</Text>
      </View>
    );
  }

  if (error && !mesaValidada) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" size={80} color="#F44336" />
        <Text style={styles.errorText}>Erro ao validar QR code</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="two-columns"
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchData}
        refreshing={loading}
      />

      {quantidadeTotal > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartText}>{quantidadeTotal} item(s) no carrinho</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleFinalizarPedido}
            disabled={enviandoPedido}
          >
            {enviandoPedido ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon name="shopping-cart" size={20} color="#FFF" />
                <Text style={styles.cartButtonText}>Finalizar Pedido</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function MesaCardapioScreen() {
  return (
    <MesaCarrinhoProvider>
      <MesaCardapioContent />
    </MesaCarrinhoProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  listContainer: {
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    width: '100%',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 10,
    alignSelf: 'center',
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: Platform.OS === 'web' ? 'center' : 'space-between',
    gap: Platform.OS === 'web' ? 20 : 10,
  },
  mesaHeader: {
    backgroundColor: '#333',
    padding: 20,
    marginBottom: 16,
  },
  mesaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  mesaSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 4,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  cartInfo: {
    flex: 1,
  },
  cartText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

