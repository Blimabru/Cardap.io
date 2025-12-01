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
import { Background } from '@react-navigation/elements';

const HomeScreen = () => {
  // Hook de navegação para mudanças de tela
  const router = useRouter();
  // Dimensões da tela para layout responsivo
  const { width: screenWidth } = useWindowDimensions();
  // Função do contexto para adicionar produtos ao carrinho
  const { adicionarAoCarrinho } = useCarrinho();
  // Estado de autenticação do usuário
  const { autenticado, usuario } = useAuth();
  
  // Variáveis responsivas baseadas na largura da tela - totalmente responsivo
  const isWeb = Platform.OS === 'web';
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;
  const isVeryLargeScreen = screenWidth >= 768;
  
  // Largura base para cálculos - totalmente responsivo
  const baseWidth = screenWidth;
  
  // Cálculo de largura dos cards baseado na plataforma e tamanho da tela - totalmente responsivo
  const numColumns = isSmallScreen ? 1 : 2; // 1 coluna em telas pequenas, 2 em outras
  const horizontalPadding = isWeb 
    ? (isSmallScreen ? 12 : isMediumScreen ? 24 : isLargeScreen ? 15 : Math.min(15, screenWidth * 0.036))
    : (isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029));
  const cardSpacing = isWeb 
    ? (isSmallScreen ? 12 : isMediumScreen ? 16 : isLargeScreen ? 10 : Math.min(10, screenWidth * 0.024))
    : (isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 10 : Math.min(10, screenWidth * 0.024));
  
  // Largura disponível para os cards (garantir que não ultrapasse a tela)
  const availableWidth = screenWidth; // Sempre usar a largura real da tela
  // Largura de cada card (2 colunas com espaçamento) - totalmente responsivo
  const cardWidth = numColumns === 1 
    ? availableWidth - (horizontalPadding * 2)
    : (availableWidth - (horizontalPadding * 2) - cardSpacing) / numColumns;
  
  // Garantir que o cardWidth nunca seja negativo ou muito pequeno
  const finalCardWidth = Math.max(100, cardWidth);
  
  // Tamanhos de fonte responsivos - totalmente responsivo
  const titleFontSize = isSmallScreen 
    ? 18 
    : isMediumScreen 
    ? 20 
    : isLargeScreen
    ? 20
    : Math.min(20, screenWidth * 0.049);
  const sectionTitleFontSize = isSmallScreen 
    ? 16 
    : isMediumScreen 
    ? 18 
    : isLargeScreen
    ? 18
    : Math.min(18, screenWidth * 0.044);
  const bodyFontSize = isSmallScreen 
    ? 14 
    : isMediumScreen 
    ? 16 
    : isLargeScreen
    ? 16
    : Math.min(16, screenWidth * 0.039);

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

  // Criar estilos dinâmicos baseados no tamanho da tela
  const dynamicStyles = createDynamicStyles(screenWidth, {
    horizontalPadding,
    titleFontSize,
    sectionTitleFontSize,
    bodyFontSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isWeb,
  });

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
        width: finalCardWidth,
        maxWidth: finalCardWidth, // Garantir que não ultrapasse a largura calculada
        marginRight: isFirstInRow && numColumns === 2 ? cardSpacing : 0,
        marginBottom: 15, // Espaçamento vertical consistente
        flexShrink: 0, // Não encolher
        overflow: 'hidden', // Prevenir overflow
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
        <View style={{
          backgroundColor: '#E95322'
        }}>
          <View style={dynamicStyles.visitorBanner}>
            <Icon name="info" size={isSmallScreen ? 14 : 16} color="#2196F3" /> {/* Fixo a partir de 412px */}
            <Text style={dynamicStyles.visitorBannerText}>
              Você está navegando como visitante. Faça login para acessar mais funcionalidades.
            </Text>
          </View>
        </View>
      )}
      <SearchBar onSearch={handleSearch} />
      <CategoryList 
        categories={categories} 
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      <View style={dynamicStyles.titleContainer}>
        <Text style={dynamicStyles.sectionTitle}>
          {selectedCategory ? 'Itens Filtrados' : 'Todos os Itens'}
        </Text>
        {(searchQuery || selectedCategory) && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            style={dynamicStyles.clearButton}
          >
            <Text style={dynamicStyles.clearButtonText}>Limpar Filtros</Text>
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
        // Layout responsivo: 1 coluna em telas pequenas, 2 em outras
        numColumns={numColumns}
        key={`columns-${numColumns}`} // Key forçada para rebuild quando numColumns muda
        ListHeaderComponent={renderListHeader} // Header com busca e filtros
        // Componente mostrado quando lista está vazia
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        )}
        contentContainerStyle={[
          dynamicStyles.listContainer,
          { 
            paddingHorizontal: horizontalPadding,
            width: '100%',
            maxWidth: '100%',
          }
        ]} // Style do container da lista
        columnWrapperStyle={numColumns === 2 ? [
          dynamicStyles.columnWrapper,
          {
            width: '100%',
            maxWidth: '100%',
          }
        ] : undefined} // Style para espaçamento entre colunas
        showsVerticalScrollIndicator={false} // Esconde scroll indicator
        // Pull-to-refresh functionality
        onRefresh={fetchData} // Function executada no pull-to-refresh
        refreshing={loading} // Estado de loading do refresh
      />
    </SafeAreaView>
  );
};

// Função para criar estilos dinâmicos baseados no tamanho da tela
const createDynamicStyles = (
  screenWidth: number,
  {
    horizontalPadding,
    titleFontSize,
    sectionTitleFontSize,
    bodyFontSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isWeb,
  }: {
    horizontalPadding: number;
    titleFontSize: number;
    sectionTitleFontSize: number;
    bodyFontSize: number;
    isSmallScreen: boolean;
    isMediumScreen: boolean;
    isLargeScreen: boolean;
    isWeb: boolean;
  }
) => {
  return StyleSheet.create({
    // Container da lista de produtos
    listContainer: {
      // Web: largura máxima para evitar layout muito largo
      // Totalmente responsivo
      maxWidth: '100%',
      width: '100%', // Sempre responsivo
      // Padding será aplicado inline
      alignSelf: 'stretch',
    },
    // Espaçamento entre colunas da FlatList (quando numColumns=2)
    columnWrapper: {
      justifyContent: isWeb ? 'center' : 'space-between',
      paddingHorizontal: 0, // Remover padding horizontal do wrapper
      marginHorizontal: 0, // Remover margin horizontal do wrapper
      flexWrap: 'wrap', // Permitir quebra de linha se necessário
    },
    // Container do título da seção com botão de limpar filtros
    titleContainer: {
      flexDirection: 'row', // Título à esquerda, botão à direita
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 15 : isLargeScreen ? 15 : Math.min(15, screenWidth * 0.036),
      paddingBottom: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 10 : Math.min(10, screenWidth * 0.024),
    },
    // Título principal da seção
    sectionTitle: {
      fontSize: sectionTitleFontSize,
      fontWeight: 'bold',
      color: '#333',
    },
    // Botão de limpar filtros
    clearButton: {
      paddingHorizontal: isSmallScreen ? 10 : 12,
      paddingVertical: isSmallScreen ? 5 : 6,
      backgroundColor: '#F0F0F0',
      borderRadius: 6,
      marginTop: 10,
    },
    clearButtonText: {
      fontSize: isSmallScreen ? 11 : 12,
      color: '#666',
      fontWeight: '600',
    },
    visitorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E3F2FD',
      padding: isSmallScreen ? 10 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      marginHorizontal: isSmallScreen ? 12 : isMediumScreen ? 15 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      marginTop: isSmallScreen ? 12 : isMediumScreen ? 15 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      marginBottom: isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      borderRadius: 8,
      gap: isSmallScreen ? 6 : isMediumScreen ? 8 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      
    },
    visitorBannerText: {
      flex: 1,
      fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 13 : Math.min(13, screenWidth * 0.032),
      color: '#1976D2',
      lineHeight: isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
    },
  });
};

// Estilos estáticos da tela usando StyleSheet para otimização
const styles = StyleSheet.create({
  // Container principal com SafeArea
  safeArea: {
    flex: 1, // Ocupa toda a tela disponível
    backgroundColor: '#FFFFFF',
    // Adiciona padding no Android para evitar sobreposição da status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    // Sempre stretch para garantir que não ultrapasse a tela
    alignItems: 'stretch',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden', // Prevenir overflow
  },
  // Container da lista de produtos
  listContainer: {
    // Sempre usar 100% da largura disponível
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
  },
  // Espaçamento entre colunas da FlatList (quando numColumns=2)
  columnWrapper: {
    justifyContent: Platform.OS === 'web' ? 'center' : 'space-between',
    paddingHorizontal: 0, // Remover padding horizontal do wrapper
    marginHorizontal: 0, // Remover margin horizontal do wrapper
    flexWrap: 'wrap', // Permitir quebra de linha se necessário
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
});

export default HomeScreen;