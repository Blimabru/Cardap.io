/**
 * ============================================================================
 * INDEX.TSX - TELA PRINCIPAL DO CARDÁPIO
 * ============================================================================
 * 
 * Esta é a tela principal do aplicativo onde os usuários visualizam o cardápio.
 * 
 * FUNCIONALIDADES PRINCIPAIS:
 * - Exibição de produtos organizados por categoria
 * - Sistema de busca em tempo real
 * - Filtro por categoria
 * - Adicionar produtos ao carrinho
 * - Header personalizado com informações do usuário
 * - Loading e error states
 * 
 * FLUXO DO USUÁRIO:
 * 1. Usuário abre o app → Esta tela é carregada
 * 2. Produtos são buscados no Supabase
 * 3. Usuário pode buscar/filtrar produtos
 * 4. Usuário clica em produto → Adiciona ao carrinho
 * 5. Navegação para outras abas (carrinho, pedidos, etc.)
 * 
 * ESTADO GERENCIADO:
 * - Lista de produtos e categorias
 * - Filtros de busca e categoria
 * - Estados de loading/error
 * - Integração com contexto do carrinho
 */

import React, { useEffect, useState } from 'react';
// Componentes básicos do React Native
import {
  ActivityIndicator, // Botão tocável com feedback
  Alert, // Indicador de carregamento
  FlatList, // Lista otimizada para muitos itens
  Platform, // Detecta plataforma (iOS/Android)
  SafeAreaView, // Área segura (evita notch/barra status)
  StatusBar, // Barra de status do dispositivo
  StyleSheet, // Estilos otimizados
  Text, // Container básico
  TouchableOpacity, // Componente de texto
  useWindowDimensions, // Hook para dimensões da tela
  View, // Container básico
} from 'react-native';
// Ícones Material Design
import { MaterialIcons as Icon } from '@expo/vector-icons';
// Hook de navegação do Expo Router
import { useRouter } from 'expo-router';
// Contextos personalizados para estado global
import { useAuth } from '../../contexts/AuthContext';
import { useCarrinho } from '../../contexts/CarrinhoContext';
// Tipos TypeScript do projeto
import { Categoria, Produto } from '../../types';
// Services para comunicação com API/Supabase
import * as categoriasService from '../../services/categorias.service';
import * as produtosService from '../../services/produtos.service';

// Componentes personalizados reutilizáveis
import CategoryList from '../../components/CategoryList'; // Lista de categorias
import HomeHeader from '../../components/HomeHeader'; // Header da home
import ItemCard from '../../components/ItemCard'; // Card de produto
import SearchBar from '../../components/SearchBar'; // Barra de busca

const HomeScreen = () => {
  // Hook de navegação para mudanças de tela
  const router = useRouter();
  // Dimensões da tela para layout responsivo
  const { width: screenWidth } = useWindowDimensions();
  // Função do contexto para adicionar produtos ao carrinho
  const { adicionarAoCarrinho } = useCarrinho();
  // Estado de autenticação do usuário
  const { autenticado, usuario } = useAuth();
  
  // Cálculo de largura dos cards baseado na plataforma e tamanho da tela
  const isWeb = Platform.OS === 'web';
  const numColumns = 2;
  const horizontalPadding = isWeb ? 40 : 10;
  const cardSpacing = isWeb ? 20 : 10;
  // Largura máxima do container no web (para centralizar conteúdo)
  const maxContainerWidth = isWeb ? Math.min(1200, screenWidth) : screenWidth;
  // Largura de cada card (2 colunas com espaçamento)
  const cardWidth = (maxContainerWidth - (horizontalPadding * 2) - cardSpacing) / numColumns;

  // Estados locais da tela
  const [products, setProducts] = useState<Produto[]>([]); // Lista completa de produtos
  const [filteredProducts, setFilteredProducts] = useState<Produto[]>([]); // Produtos filtrados por busca/categoria
  const [categories, setCategories] = useState<Categoria[]>([]); // Lista de categorias
  const [loading, setLoading] = useState(true); // Estado de carregamento inicial
  const [error, setError] = useState<string | null>(null); // Mensagem de erro se houver
  const [searchQuery, setSearchQuery] = useState(''); // Texto da busca
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Categoria selecionada

  // Efeito executado uma vez ao montar o componente
  useEffect(() => {
    fetchData(); // Busca dados iniciais (produtos e categorias)
  }, []);

  // Efeito executado sempre que filtros mudam
  useEffect(() => {
    filterProducts(); // Re-filtra produtos baseado nos critérios atuais
  }, [searchQuery, selectedCategory, products]);

  /**
   * Função para buscar dados iniciais da tela
   * 
   * Executa requisições paralelas para buscar produtos e categorias
   * do Supabase, atualiza os estados e gerencia loading/error states.
   */
  const fetchData = async () => {
    try {
      // Ativa estado de carregamento e limpa erros anteriores
      setLoading(true);
      setError(null);

      // Executa requisições em paralelo para otimizar performance
      // Promise.all aguarda ambas as requisições terminarem
      const [productsData, categoriesData] = await Promise.all([
        produtosService.listarProdutos(), // Busca todos os produtos ativos
        categoriasService.listarCategorias(), // Busca todas as categorias
      ]);

      // Atualiza estados com os dados recebidos
      setProducts(productsData); // Lista completa de produtos
      setCategories(categoriesData); // Lista de categorias para filtro
      setFilteredProducts(productsData); // Inicialmente mostra todos os produtos
    } catch (e) {
      // Tratamento de erro com type safety
      if (e instanceof Error) {
        setError(e.message); // Usa mensagem do erro se for Error
      } else {
        setError('Um erro desconhecido ocorreu.'); // Fallback para outros tipos
      }
      console.error(e); // Log para debug
    } finally {
      // Sempre desativa loading, independente de sucesso/erro
      setLoading(false);
    }
  };

  /**
   * Filtra a lista de produtos baseado nos critérios ativos
   * 
   * Aplica filtros de busca por nome e categoria selecionada.
   * Executado automaticamente quando filtros mudam via useEffect.
   */
  const filterProducts = () => {
    // Cria cópia da lista original para aplicar filtros
    let filtered = [...products];

    // Filtro por texto de busca (ignora case-sensitive)
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por categoria selecionada
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category.id === selectedCategory);
    }

    // Atualiza estado com produtos filtrados
    setFilteredProducts(filtered);
  };

  /**
   * Handler para mudanças no campo de busca
   * 
   * @param query - Texto digitado pelo usuário
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  /**
   * Handler para seleção de categoria
   * 
   * @param categoryId - ID da categoria selecionada ou null para "todas"
   */
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  /**
   * Adiciona produto ao carrinho e exibe confirmação
   * 
   * @param product - Produto a ser adicionado
   */
  const handleAddToCart = (product: Produto) => {
    // Adiciona 1 unidade do produto ao carrinho
    adicionarAoCarrinho(product, 1);
    // Mostra feedback visual para o usuário
    Alert.alert('Sucesso', `${product.name} adicionado ao carrinho!`);
  };

  /**
   * Render function para cada item da FlatList
   * 
   * @param item - Produto a ser renderizado
   * @param index - Índice do item na lista
   * @returns Component ItemCard configurado com wrapper de largura controlada
   */
  const renderItem = ({ item, index }: { item: Produto; index: number }) => {
    // Aplicar marginRight apenas no primeiro item de cada linha (índice par)
    const isFirstInRow = index % 2 === 0;
    return (
      <View style={{ 
        width: cardWidth,
        maxWidth: cardWidth, // Garantir que não ultrapasse a largura calculada
        marginRight: isFirstInRow ? cardSpacing : 0,
        marginBottom: 15, // Espaçamento vertical consistente
        flexShrink: 0, // Não encolher
      }}>
        <ItemCard item={item} onAddToCart={() => handleAddToCart(item)} />
      </View>
    );
  };

  /**
   * Componente header da lista (renderizado no topo da FlatList)
   * 
   * Inclui header personalizado, barra de busca, lista de categorias
   * e título da seção com botão de limpar filtros.
   */
  const renderListHeader = () => (
    <>
      {/* Header personalizado com saudação e informações do usuário */}
      <HomeHeader />
      {/* Banner informativo para usuários não autenticados */}
      {!autenticado && (
        <View style={styles.visitorBanner}>
          <Icon name="info" size={16} color="#2196F3" />
          <Text style={styles.visitorBannerText}>
            Você está navegando como visitante. Faça login para acessar mais funcionalidades.
          </Text>
        </View>
      )}
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

  // Estado de carregamento: mostra spinner centralizado
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Carregando cardápio...</Text>
      </View>
    );
  }

  // Estado de erro: mostra mensagem e botão de retry
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

  // Estado normal: renderiza lista de produtos
  return (
    // SafeAreaView garante que o conteúdo não sobreponha a barra de status
    <SafeAreaView style={styles.safeArea}>
      {/* FlatList otimizada para listas grandes com lazy loading */}
      <FlatList
        data={filteredProducts} // Produtos filtrados por busca/categoria
        renderItem={renderItem} // Function que renderiza cada produto
        keyExtractor={(item) => item.id} // Chave única para otimização
        // Layout em 2 colunas para mobile
        numColumns={2}
        key="two-columns" // Key forçada para rebuild quando numColumns muda
        ListHeaderComponent={renderListHeader} // Header com busca e filtros
        // Componente mostrado quando lista está vazia
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer} // Style do container da lista
        columnWrapperStyle={styles.columnWrapper} // Style para espaçamento entre colunas
        showsVerticalScrollIndicator={false} // Esconde scroll indicator
        // Pull-to-refresh functionality
        onRefresh={fetchData} // Function executada no pull-to-refresh
        refreshing={loading} // Estado de loading do refresh
      />
    </SafeAreaView>
  );
};

// Estilos da tela usando StyleSheet para otimização
const styles = StyleSheet.create({
  // Container principal com SafeArea
  safeArea: {
    flex: 1, // Ocupa toda a tela disponível
    backgroundColor: '#FFFFFF',
    // Adiciona padding no Android para evitar sobreposição da status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    // Web: centraliza conteúdo horizontalmente
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  // Container da lista de produtos
  listContainer: {
    // Web: largura máxima para evitar layout muito largo
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    width: '100%',
    // Padding horizontal diferente por plataforma
    paddingHorizontal: Platform.OS === 'web' ? 40 : 10,
    alignSelf: 'center',
  },
  // Espaçamento entre colunas da FlatList (quando numColumns=2)
  columnWrapper: {
    justifyContent: Platform.OS === 'web' ? 'center' : 'space-between',
    paddingHorizontal: 0, // Remover padding horizontal do wrapper
    marginHorizontal: 0, // Remover margin horizontal do wrapper
    flexWrap: 'wrap', // Permitir quebra de linha se necessário
  },
  // Container do título da seção com botão de limpar filtros
  titleContainer: {
    flexDirection: 'row', // Título à esquerda, botão à direita
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  // Título principal da seção
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  // Botão de limpar filtros
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
  // Container centralizado para loading e estados de erro
  centerContainer: {
    flex: 1,
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    backgroundColor: '#fff',
    padding: 32,
  },
  // Texto principal de erro
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
  visitorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  visitorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
});

export default HomeScreen;