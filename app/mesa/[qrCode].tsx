/**
 * Tela de Cardápio Público via QR Code
 * 
 * Acesso público ao cardápio sem necessidade de login
 * Vinculado a uma mesa específica
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { MesaCarrinhoProvider, useMesaCarrinho } from '../../contexts/MesaCarrinhoContext';
import * as categoriasService from '../../services/categorias.service';
import * as pedidosService from '../../services/pedidos.service';
import * as produtosService from '../../services/produtos.service';
import * as qrcodeService from '../../services/qrcode.service';
import { Categoria, Mesa, Pedido, Produto, StatusPedido, TipoPedido } from '../../types';

// Componentes
import CategoryList from '../../components/CategoryList';
import ItemCard from '../../components/ItemCard';
import SearchBar from '../../components/SearchBar';

function MesaCardapioContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrCode = params.qrCode as string;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Variáveis responsivas baseadas na largura da tela - totalmente responsivo
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;
  
  // Padding responsivo - totalmente responsivo (igual à tela principal)
  const horizontalPadding = isSmallScreen 
    ? 8 
    : isMediumScreen 
    ? 12 
    : isLargeScreen
    ? Math.min(16, screenWidth * 0.039)
    : Math.min(16, screenWidth * 0.039);
  const verticalPadding = isSmallScreen 
    ? 12 
    : isMediumScreen 
    ? 16 
    : isLargeScreen
    ? Math.min(20, screenWidth * 0.049)
    : Math.min(20, screenWidth * 0.049);
  
  // Tamanhos de fonte responsivos - totalmente responsivo
  const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 20 : Math.min(20, screenWidth * 0.049);
  const subtitleFontSize = isSmallScreen ? 12 : isMediumScreen ? 13 : Math.min(14, screenWidth * 0.034);
  const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : Math.min(16, screenWidth * 0.039);
  
  // Cálculo de largura dos cards (1 coluna em telas pequenas, 2 em médias/grandes)
  const numColumns = isSmallScreen ? 1 : 2;
  const cardSpacing = isSmallScreen ? 0 : isMediumScreen ? 8 : Math.min(10, screenWidth * 0.024);
  // Largura disponível para os cards (garantir que não ultrapasse a tela)
  const availableWidth = screenWidth; // Sempre usar a largura real da tela
  // Largura de cada card (2 colunas com espaçamento) - totalmente responsivo
  const cardWidth = numColumns === 1 
    ? availableWidth - (horizontalPadding * 2)
    : (availableWidth - (horizontalPadding * 2) - cardSpacing) / numColumns;
  
  // Garantir que o cardWidth nunca seja negativo ou muito pequeno
  const finalCardWidth = Math.max(100, cardWidth);
  
  const { 
    itens, 
    mesa, 
    idMesa, 
    adicionarAoCarrinho, 
    limparCarrinho, 
    quantidadeTotal, 
    valorSubtotal,
    definirMesa,
    removerDoCarrinho,
    atualizarQuantidade,
    atualizarObservacoes,
  } = useMesaCarrinho();

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
  const [modalCarrinhoAberto, setModalCarrinhoAberto] = useState(false);
  const [observacoesPedido, setObservacoesPedido] = useState('');
  const [modalContaAberto, setModalContaAberto] = useState(false);
  const [pedidosMesa, setPedidosMesa] = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(false);

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
      console.log('🔍 Validando QR code:', qrCode);
      
      const mesa = await qrcodeService.validarQRCode(qrCode);
      
      console.log('✅ Mesa validada:', JSON.stringify({
        id: mesa.id,
        numero: mesa.numero,
        status: mesa.status,
        qr_code: mesa.qr_code,
      }, null, 2));
      
      setMesaValidada(mesa);
      // Definir mesa no contexto
      definirMesa(mesa);
    } catch (erro: any) {
      // Serializar erro corretamente
      const erroDetalhado = {
        message: erro?.message || 'Erro desconhecido',
        name: erro?.name,
        qr_code: qrCode,
      };
      
      console.error('❌ Erro ao validar QR code:', JSON.stringify(erroDetalhado, null, 2));
      
      const mensagemErro = erro?.message || 'QR code inválido';
      setError(mensagemErro);
      
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
      // Serializar erro corretamente
      const erroDetalhado = {
        message: e instanceof Error ? e.message : 'Erro desconhecido',
        name: e instanceof Error ? e.name : 'UnknownError',
        stack: e instanceof Error ? e.stack : undefined,
      };
      
      console.error('❌ Erro ao carregar dados:', JSON.stringify(erroDetalhado, null, 2));
      
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Um erro desconhecido ocorreu.');
      }
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

  const carregarPedidosMesa = async () => {
    if (!idMesa) return;
    
    try {
      setCarregandoPedidos(true);
      const pedidos = await pedidosService.listarPedidosPendentesPorMesa(idMesa);
      setPedidosMesa(pedidos);
    } catch (erro: any) {
      console.error('Erro ao carregar pedidos da mesa:', JSON.stringify(erro, null, 2));
    } finally {
      setCarregandoPedidos(false);
    }
  };

  const handleAbrirModalConta = async () => {
    setModalContaAberto(true);
    await carregarPedidosMesa();
  };

  const calcularTotalConta = (): number => {
    return pedidosMesa.reduce((total, pedido) => total + pedido.total, 0);
  };

  const formatarStatusPedido = (status: StatusPedido): string => {
    const statusMap: Record<StatusPedido, string> = {
      [StatusPedido.PENDENTE]: 'Pendente',
      [StatusPedido.CONFIRMADO]: 'Confirmado',
      [StatusPedido.EM_PREPARO]: 'Em Preparo',
      [StatusPedido.PRONTO]: 'Pronto',
      [StatusPedido.SAIU_ENTREGA]: 'Saiu para Entrega',
      [StatusPedido.ENTREGUE]: 'Entregue',
      [StatusPedido.CANCELADO]: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  const corStatusPedido = (status: StatusPedido): string => {
    const coresMap: Record<StatusPedido, string> = {
      [StatusPedido.PENDENTE]: '#FFA500',
      [StatusPedido.CONFIRMADO]: '#2196F3',
      [StatusPedido.EM_PREPARO]: '#9C27B0',
      [StatusPedido.PRONTO]: '#4CAF50',
      [StatusPedido.SAIU_ENTREGA]: '#00BCD4',
      [StatusPedido.ENTREGUE]: '#4CAF50',
      [StatusPedido.CANCELADO]: '#F44336',
    };
    return coresMap[status] || '#757575';
  };

  const handleFinalizarPedido = async () => {
    if (!idMesa || itens.length === 0) {
      Alert.alert('Atenção', 'Seu carrinho está vazio');
      return;
    }

    setEnviandoPedido(true);
    try {
      const dadosPedido = {
        id_mesa: idMesa,
        quantidade_itens: itens.length,
        mesa_numero: mesaValidada?.numero,
        itens: itens.map((item) => ({
          id_produto: item.produto.id,
          quantidade: item.quantidade,
          observacoes: item.observacoes,
        })),
      };
      
      console.log('📝 Iniciando criação de pedido:', JSON.stringify(dadosPedido, null, 2));

      const pedidoCriado = await pedidosService.criarPedido({
        itens: dadosPedido.itens,
        tipo_pedido: TipoPedido.LOCAL,
        id_mesa: idMesa,
        observacoes: observacoesPedido || undefined,
      });

        console.log('✅ Pedido criado com sucesso:', JSON.stringify({
          id: pedidoCriado.id,
          id_mesa: pedidoCriado.id_mesa,
          usuario: pedidoCriado.usuario ? pedidoCriado.usuario.id : null,
          status: pedidoCriado.status,
          total: pedidoCriado.total,
        }, null, 2));

        limparCarrinho();
        setObservacoesPedido('');
        setModalCarrinhoAberto(false);
        
        // Atualizar lista de pedidos se modal de conta estiver aberto
        if (modalContaAberto) {
          await carregarPedidosMesa();
        }

      Alert.alert(
        'Pedido Realizado!',
        'Seu pedido foi enviado com sucesso. Aguarde o atendimento.',
        [{ text: 'OK' }]
      );
    } catch (erro: any) {
      // Serializar erro corretamente para logs
      const erroDetalhado = {
        message: erro?.message || 'Erro desconhecido',
        name: erro?.name,
        stack: erro?.stack,
        id_mesa: idMesa,
        quantidade_itens: itens.length,
      };
      
      console.error('❌ Erro ao finalizar pedido:', JSON.stringify(erroDetalhado, null, 2));
      
      // Mensagem de erro mais amigável para o usuário
      let mensagemErro = 'Não foi possível finalizar o pedido.';
      
      if (erro?.message) {
        // Extrair mensagem mais clara do erro
        if (erro.message.includes('autenticado') || erro.message.includes('autenticação')) {
          mensagemErro = 'Erro de autenticação. Por favor, tente novamente.';
        } else if (erro.message.includes('RLS') || erro.message.includes('policy')) {
          mensagemErro = 'Erro de permissão. Por favor, verifique se o QR code está correto.';
        } else if (erro.message.includes('produto') || erro.message.includes('Produto')) {
          mensagemErro = 'Erro ao processar produtos. Por favor, tente novamente.';
        } else {
          mensagemErro = erro.message;
        }
      }
      
      Alert.alert(
        'Erro ao Finalizar Pedido',
        mensagemErro,
        [
          { text: 'Tentar Novamente', style: 'default' },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } finally {
      setEnviandoPedido(false);
    }
  };

  const renderItem = ({ item, index }: { item: Produto; index: number }) => {
    // Aplicar marginRight apenas no primeiro item de cada linha quando tiver 2 colunas
    const isFirstInRow = numColumns === 2 && index % 2 === 0;
    return (
      <View style={{ 
        width: finalCardWidth,
        maxWidth: finalCardWidth, // Garantir que não ultrapasse a largura calculada
        marginRight: isFirstInRow ? cardSpacing : 0,
        marginBottom: 15, // Espaçamento vertical consistente
        flexShrink: 0, // Não encolher
      }}>
        <ItemCard item={item} onAddToCart={() => handleAddToCart(item)} />
      </View>
    );
  };

  // Criar estilos dinâmicos baseados nas dimensões (apenas uma vez)
  const dynamicStyles = createDynamicStyles(screenWidth, screenHeight, {
    horizontalPadding,
    verticalPadding,
    titleFontSize,
    subtitleFontSize,
    bodyFontSize,
    cardWidth: finalCardWidth,
    cardSpacing,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
  });

  const renderListHeader = () => (
    <>
      <View style={dynamicStyles.mesaHeader}>
        <View style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Text style={dynamicStyles.mesaTitle} numberOfLines={1} ellipsizeMode="tail">
            Mesa #{mesaValidada?.numero}
          </Text>
          <Text style={dynamicStyles.mesaSubtitle} numberOfLines={2} ellipsizeMode="tail">
            Escaneie o QR code para acessar o cardápio
          </Text>
        </View>
      </View>
      <SearchBar onSearch={handleSearch} />
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      <View style={dynamicStyles.titleContainer}>
        <Text style={dynamicStyles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
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

  if (validandoQR) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={dynamicStyles.loadingText}>Validando QR code...</Text>
      </View>
    );
  }

  if (error && !mesaValidada) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <Icon name="error-outline" size={isSmallScreen ? 60 : 80} color="#F44336" />
        <Text style={dynamicStyles.errorText}>Erro ao validar QR code</Text>
        <Text style={dynamicStyles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={dynamicStyles.retryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={dynamicStyles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={dynamicStyles.loadingText}>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <FlatList
        data={filteredProducts}
        renderItem={({ item, index }) => renderItem({ item, index })}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns === 1 ? 'one-column' : 'two-columns'}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={() => (
          <View style={dynamicStyles.emptyContainer}>
            <Icon name="search-off" size={isSmallScreen ? 60 : 80} color="#DDD" />
            <Text style={dynamicStyles.emptyText}>Nenhum produto encontrado</Text>
          </View>
        )}
        contentContainerStyle={[
          dynamicStyles.listContainer,
          { 
            paddingHorizontal: horizontalPadding,
            width: '100%',
            maxWidth: '100%',
          }
        ]}
        columnWrapperStyle={numColumns > 1 ? [
          dynamicStyles.columnWrapper,
          {
            width: '100%',
            maxWidth: '100%',
          }
        ] : undefined}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchData}
        refreshing={loading}
      />

      {quantidadeTotal > 0 && (
        <View style={dynamicStyles.cartFooter}>
          <TouchableOpacity
            style={dynamicStyles.cartInfoButton}
            onPress={() => setModalCarrinhoAberto(true)}
          >
            <View style={dynamicStyles.cartInfo}>
              <Icon name="shopping-cart" size={isSmallScreen ? 18 : 20} color="#4CAF50" />
              <Text style={dynamicStyles.cartText}>{quantidadeTotal} item(s)</Text>
              <Text style={dynamicStyles.cartTotal}>R$ {valorSubtotal.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={dynamicStyles.cartButton}
            onPress={handleFinalizarPedido}
            disabled={enviandoPedido}
          >
            {enviandoPedido ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={dynamicStyles.cartButtonText}>Finalizar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Carrinho */}
      <Modal
        visible={modalCarrinhoAberto}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCarrinhoAberto(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                Carrinho - Mesa #{mesaValidada?.numero}
              </Text>
              <TouchableOpacity
                onPress={() => setModalCarrinhoAberto(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Icon name="close" size={isSmallScreen ? 20 : 24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={dynamicStyles.modalBody}
              contentContainerStyle={dynamicStyles.modalBodyContent}
              showsVerticalScrollIndicator={true}
            >
              {itens.length === 0 ? (
                <View style={dynamicStyles.emptyCartContainer}>
                  <Icon name="shopping-cart" size={isSmallScreen ? 50 : 60} color="#DDD" />
                  <Text style={dynamicStyles.emptyCartText}>Carrinho vazio</Text>
                </View>
              ) : (
                <>
                  {itens.map((item) => {
                    const preco = typeof item.produto.price === 'string' 
                      ? parseFloat(item.produto.price) 
                      : item.produto.price;
                    const subtotal = preco * item.quantidade;

                    return (
                      <View key={item.produto.id} style={dynamicStyles.cartItemModal}>
                        {item.produto.imageUrl ? (
                          <Image 
                            source={{ uri: item.produto.imageUrl }} 
                            style={dynamicStyles.cartItemImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[dynamicStyles.cartItemImage, dynamicStyles.cartItemImagePlaceholder]}>
                            <Icon name="image" size={isSmallScreen ? 20 : 24} color="#999" />
                          </View>
                        )}
                        <View style={dynamicStyles.cartItemInfo}>
                          <Text style={dynamicStyles.cartItemName} numberOfLines={2} ellipsizeMode="tail">
                            {item.produto.name}
                          </Text>
                          <Text style={dynamicStyles.cartItemPrice}>R$ {preco.toFixed(2)}</Text>
                          
                          <View style={dynamicStyles.cartItemQuantity}>
                            <TouchableOpacity
                              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
                              style={dynamicStyles.quantityButtonModal}
                            >
                              <Icon name="remove" size={isSmallScreen ? 16 : 18} color="#333" />
                            </TouchableOpacity>
                            <Text style={dynamicStyles.quantityTextModal}>{item.quantidade}</Text>
                            <TouchableOpacity
                              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
                              style={dynamicStyles.quantityButtonModal}
                            >
                              <Icon name="add" size={isSmallScreen ? 16 : 18} color="#333" />
                            </TouchableOpacity>
                          </View>

                          <TextInput
                            style={dynamicStyles.cartItemObservacoes}
                            placeholder="Observações (opcional)"
                            value={item.observacoes || ''}
                            onChangeText={(text) => atualizarObservacoes(item.produto.id, text)}
                            multiline
                            maxLength={200}
                          />
                        </View>
                        <View style={dynamicStyles.cartItemActions}>
                          <Text style={dynamicStyles.cartItemSubtotal}>R$ {subtotal.toFixed(2)}</Text>
                          <TouchableOpacity
                            onPress={() => removerDoCarrinho(item.produto.id)}
                            style={dynamicStyles.removeButtonModal}
                          >
                            <Icon name="delete" size={isSmallScreen ? 18 : 20} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  <View style={dynamicStyles.observacoesContainer}>
                    <Text style={dynamicStyles.observacoesLabel}>Observações Gerais do Pedido</Text>
                    <TextInput
                      style={dynamicStyles.observacoesInput}
                      placeholder="Ex: Sem cebola, ponto da carne..."
                      value={observacoesPedido}
                      onChangeText={setObservacoesPedido}
                      multiline
                      numberOfLines={3}
                      maxLength={500}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            {itens.length > 0 && (
              <View style={dynamicStyles.modalFooter}>
                <View style={dynamicStyles.modalTotal}>
                  <Text style={dynamicStyles.modalTotalLabel}>Total ({quantidadeTotal} itens)</Text>
                  <Text style={dynamicStyles.modalTotalValue}>R$ {valorSubtotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={[dynamicStyles.modalFinalizarButton, enviandoPedido && dynamicStyles.buttonDisabled]}
                  onPress={handleFinalizarPedido}
                  disabled={enviandoPedido}
                >
                  {enviandoPedido ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={dynamicStyles.modalFinalizarButtonText}>Finalizar Pedido</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Botão Flutuante Ver Conta */}
      {idMesa && (
        <TouchableOpacity
          style={dynamicStyles.floatingButton}
          onPress={handleAbrirModalConta}
        >
          <Icon name="receipt" size={24} color="#FFF" />
          {pedidosMesa.length > 0 && (
            <View style={dynamicStyles.floatingButtonBadge}>
              <Text style={dynamicStyles.floatingButtonBadgeText}>
                {pedidosMesa.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Modal de Conta da Mesa */}
      <Modal
        visible={modalContaAberto}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalContaAberto(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContaContent}>
            <View style={dynamicStyles.modalContaHeader}>
              <Text style={dynamicStyles.modalContaTitle}>
                Conta - Mesa #{mesaValidada?.numero}
              </Text>
              <TouchableOpacity
                onPress={() => setModalContaAberto(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Icon name="close" size={isSmallScreen ? 20 : 24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={dynamicStyles.modalContaBody}
              contentContainerStyle={dynamicStyles.modalContaBodyContent}
              showsVerticalScrollIndicator={true}
            >
              {carregandoPedidos ? (
                <View style={dynamicStyles.modalContaLoading}>
                  <ActivityIndicator size="large" color="#333" />
                  <Text style={dynamicStyles.modalContaLoadingText}>Carregando pedidos...</Text>
                </View>
              ) : pedidosMesa.length === 0 ? (
                <View style={dynamicStyles.modalContaEmpty}>
                  <Icon name="receipt-long" size={isSmallScreen ? 50 : 60} color="#DDD" />
                  <Text style={dynamicStyles.modalContaEmptyText}>Nenhum pedido ainda</Text>
                  <Text style={dynamicStyles.modalContaEmptySubtext}>
                    Faça pedidos para ver sua conta aqui
                  </Text>
                </View>
              ) : (
                <>
                  {pedidosMesa.map((pedido) => (
                    <View key={pedido.id} style={dynamicStyles.pedidoContaCard}>
                      <View style={dynamicStyles.pedidoContaHeader}>
                        <View>
                          <Text style={dynamicStyles.pedidoContaNumero}>
                            Pedido #{pedido.numero_pedido}
                          </Text>
                          {pedido.mesa && (
                            <Text style={dynamicStyles.pedidoContaMesa}>
                              Mesa #{pedido.mesa.numero}
                            </Text>
                          )}
                          <Text style={dynamicStyles.pedidoContaData}>
                            {new Date(pedido.data_criacao).toLocaleString('pt-BR')}
                          </Text>
                        </View>
                        <View style={[
                          dynamicStyles.pedidoContaStatusBadge,
                          { backgroundColor: corStatusPedido(pedido.status) }
                        ]}>
                          <Text style={dynamicStyles.pedidoContaStatusText}>
                            {formatarStatusPedido(pedido.status)}
                          </Text>
                        </View>
                      </View>

                      <View style={dynamicStyles.pedidoContaItens}>
                        {pedido.itens.map((item, index) => (
                          <Text key={index} style={dynamicStyles.pedidoContaItemText}>
                            • {item.quantidade}x {item.produto.name} - R$ {item.subtotal.toFixed(2)}
                          </Text>
                        ))}
                      </View>

                      <View style={dynamicStyles.pedidoContaFooter}>
                        <Text style={dynamicStyles.pedidoContaTotal}>
                          Total: R$ {pedido.total.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            {pedidosMesa.length > 0 && (
              <View style={dynamicStyles.modalContaFooter}>
                <View style={dynamicStyles.modalContaTotalContainer}>
                  <Text style={dynamicStyles.modalContaTotalLabel}>Total da Conta</Text>
                  <Text style={dynamicStyles.modalContaTotalValue}>
                    R$ {calcularTotalConta().toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.modalContaPagarButton}
                  onPress={() => {
                    setModalContaAberto(false);
                    router.push(`/mesa/${qrCode}/pagamento`);
                  }}
                >
                  <Icon name="payment" size={20} color="#FFF" />
                  <Text style={dynamicStyles.modalContaPagarButtonText}>Pagar Conta</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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

// Função para criar estilos dinâmicos baseados nas dimensões da tela
const createDynamicStyles = (
  screenWidth: number,
  screenHeight: number,
  responsive: {
    horizontalPadding: number;
    verticalPadding: number;
    titleFontSize: number;
    subtitleFontSize: number;
    bodyFontSize: number;
    cardWidth: number;
    cardSpacing: number;
    isSmallScreen: boolean;
    isMediumScreen: boolean;
    isLargeScreen: boolean;
  }
) => {
  const isWeb = Platform.OS === 'web';
  const { 
    horizontalPadding, 
    verticalPadding, 
    titleFontSize, 
    subtitleFontSize, 
    bodyFontSize,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
  } = responsive;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
      alignItems: 'stretch',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    },
    listContainer: {
      maxWidth: isWeb ? 1200 : '100%',
      width: '100%',
      paddingHorizontal: 0, // Padding será aplicado inline no contentContainerStyle
      alignSelf: 'stretch',
      paddingBottom: isSmallScreen ? 120 : isMediumScreen ? 110 : Math.min(100, screenWidth * 0.243),
    },
    columnWrapper: {
      justifyContent: isWeb ? 'center' : 'space-between',
      paddingHorizontal: 0,
      marginHorizontal: 0,
      width: '100%',
      maxWidth: '100%',
    },
    mesaHeader: {
      backgroundColor: '#333',
      paddingHorizontal: horizontalPadding,
      paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : verticalPadding,
      marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : Math.min(16, screenWidth * 0.039),
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
    },
    mesaTitle: {
      fontSize: titleFontSize,
      fontWeight: 'bold',
      color: '#FFF',
      width: '100%',
      maxWidth: '100%',
    },
    mesaSubtitle: {
      fontSize: subtitleFontSize,
      color: '#FFF',
      opacity: 0.8,
      marginTop: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      width: '100%',
      maxWidth: '100%',
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: horizontalPadding,
      paddingBottom: isSmallScreen ? 8 : isMediumScreen ? 9 : Math.min(10, screenWidth * 0.024),
      flexWrap: 'wrap',
      width: '100%',
      maxWidth: '100%',
    },
    sectionTitle: {
      fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : bodyFontSize,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
      marginRight: isSmallScreen ? 6 : isMediumScreen ? 7 : Math.min(8, screenWidth * 0.019),
      minWidth: 0,
    },
    clearButton: {
      paddingHorizontal: isSmallScreen ? 10 : isMediumScreen ? 11 : Math.min(12, screenWidth * 0.029),
      paddingVertical: isSmallScreen ? 5 : isMediumScreen ? 5.5 : Math.min(6, screenWidth * 0.015),
      backgroundColor: '#F0F0F0',
      borderRadius: 6,
      flexShrink: 0,
    },
    clearButtonText: {
      fontSize: isSmallScreen ? 11 : isMediumScreen ? 11.5 : Math.min(12, screenWidth * 0.029),
      color: '#666',
      fontWeight: '600',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: isSmallScreen ? 20 : 32,
      width: '100%',
    },
    loadingText: {
      marginTop: 16,
      fontSize: isSmallScreen ? 14 : 16,
      color: '#666',
    },
    errorText: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 16,
    },
    errorSubtext: {
      fontSize: isSmallScreen ? 12 : 14,
      color: '#999',
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 16,
    },
    retryButton: {
      marginTop: 24,
      backgroundColor: '#333',
      paddingHorizontal: isSmallScreen ? 20 : 24,
      paddingVertical: isSmallScreen ? 10 : 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
    },
    emptyContainer: {
      padding: isSmallScreen ? 32 : 48,
      alignItems: 'center',
      width: '100%',
    },
    emptyText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: '#999',
      marginTop: 16,
      textAlign: 'center',
    },
    cartFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFF',
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      paddingHorizontal: horizontalPadding,
      paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : Math.min(16, screenWidth * 0.039),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: -2 },
      width: '100%',
      maxWidth: '100%',
    },
    cartInfoButton: {
      flex: 1,
      marginRight: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      minWidth: 0,
    },
    cartInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      width: '100%',
    },
    cartText: {
      fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
      color: '#666',
      fontWeight: '600',
      marginRight: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
    },
    cartTotal: {
      fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      color: '#4CAF50',
      fontWeight: 'bold',
      marginLeft: 'auto',
    },
    cartButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 20 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
      paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      borderRadius: 8,
      minWidth: isSmallScreen ? 80 : isMediumScreen ? 90 : isLargeScreen ? 100 : Math.min(100, screenWidth * 0.243),
      flexShrink: 0,
    },
    cartButtonText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: screenHeight * 0.9,
      width: '100%',
      maxWidth: '100%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: horizontalPadding,
      paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 16 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      width: '100%',
      maxWidth: '100%',
    },
    modalTitle: {
      fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
      marginRight: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      minWidth: 0,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalBody: {
      maxHeight: screenHeight * 0.6,
    },
    modalBodyContent: {
      padding: horizontalPadding,
    },
    emptyCartContainer: {
      padding: isSmallScreen ? 32 : 48,
      alignItems: 'center',
    },
    emptyCartText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: '#999',
      marginTop: 16,
    },
    cartItemModal: {
      flexDirection: 'row',
      backgroundColor: '#F9F9F9',
      borderRadius: 12,
      padding: isSmallScreen ? 8 : 12,
      marginBottom: isSmallScreen ? 8 : 12,
      width: '100%',
      maxWidth: '100%',
    },
    cartItemImage: {
      width: isSmallScreen ? 60 : 80,
      height: isSmallScreen ? 60 : 80,
      borderRadius: 8,
      backgroundColor: '#E0E0E0',
      flexShrink: 0,
    },
    cartItemImagePlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartItemInfo: {
      flex: 1,
      marginLeft: isSmallScreen ? 8 : 12,
      minWidth: 0,
    },
    cartItemName: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    cartItemPrice: {
      fontSize: isSmallScreen ? 12 : 14,
      color: '#666',
      marginBottom: 8,
    },
    cartItemQuantity: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      marginRight: isSmallScreen ? 8 : 12,
    },
    quantityButtonModal: {
      width: isSmallScreen ? 28 : 32,
      height: isSmallScreen ? 28 : 32,
      borderRadius: isSmallScreen ? 14 : 16,
      backgroundColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    quantityTextModal: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
      color: '#333',
      minWidth: isSmallScreen ? 25 : 30,
      textAlign: 'center',
      marginHorizontal: isSmallScreen ? 6 : 8,
    },
    cartItemObservacoes: {
      backgroundColor: '#FFF',
      borderRadius: 6,
      padding: isSmallScreen ? 6 : 8,
      fontSize: isSmallScreen ? 11 : 12,
      color: '#666',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      minHeight: isSmallScreen ? 35 : 40,
      width: '100%',
    },
    cartItemActions: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginLeft: isSmallScreen ? 4 : 8,
    },
    cartItemSubtotal: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: 'bold',
      color: '#4CAF50',
      marginBottom: 8,
    },
    removeButtonModal: {
      padding: 4,
    },
    observacoesContainer: {
      marginTop: 16,
      marginBottom: 8,
      width: '100%',
    },
    observacoesLabel: {
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    observacoesInput: {
      backgroundColor: '#F9F9F9',
      borderRadius: 8,
      padding: isSmallScreen ? 10 : 12,
      fontSize: isSmallScreen ? 13 : 14,
      color: '#333',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      minHeight: isSmallScreen ? 70 : 80,
      textAlignVertical: 'top',
      width: '100%',
    },
    modalFooter: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: isSmallScreen ? 12 : 20,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      backgroundColor: '#FFF',
      width: '100%',
    },
    modalTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isSmallScreen ? 12 : 16,
      width: '100%',
    },
    modalTotalLabel: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: '600',
      color: '#333',
    },
    modalTotalValue: {
      fontSize: isSmallScreen ? 20 : 24,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    modalFinalizarButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: isSmallScreen ? 14 : 16,
      borderRadius: 8,
      alignItems: 'center',
      width: '100%',
    },
    modalFinalizarButtonText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    // Botão flutuante ver conta
    floatingButton: {
      position: 'absolute',
      bottom: isSmallScreen ? 80 : isMediumScreen ? 90 : Math.min(100, screenWidth * 0.243),
      right: horizontalPadding,
      backgroundColor: '#2196F3',
      width: isSmallScreen ? 56 : isMediumScreen ? 60 : Math.min(64, screenWidth * 0.156),
      height: isSmallScreen ? 56 : isMediumScreen ? 60 : Math.min(64, screenWidth * 0.156),
      borderRadius: isSmallScreen ? 28 : isMediumScreen ? 30 : Math.min(32, screenWidth * 0.078),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      zIndex: 1000,
    },
    floatingButtonBadge: {
      position: 'absolute',
      top: isSmallScreen ? -4 : isMediumScreen ? -4 : isLargeScreen ? -4 : Math.min(-4, screenWidth * -0.010),
      right: isSmallScreen ? -4 : isMediumScreen ? -4 : isLargeScreen ? -4 : Math.min(-4, screenWidth * -0.010),
      backgroundColor: '#F44336',
      borderRadius: isSmallScreen ? 10 : isMediumScreen ? 10 : isLargeScreen ? 10 : Math.min(10, screenWidth * 0.024),
      minWidth: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      height: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
    },
    floatingButtonBadgeText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      fontWeight: 'bold',
    },
    // Modal de conta
    modalContaContent: {
      backgroundColor: '#FFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: screenHeight * 0.9,
      width: '100%',
      maxWidth: '100%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    modalContaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: horizontalPadding,
      paddingVertical: isSmallScreen ? 12 : 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      width: '100%',
    },
    modalContaTitle: {
      fontSize: isSmallScreen ? 18 : 20,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
      marginRight: 8,
    },
    modalContaBody: {
      maxHeight: screenHeight * 0.6,
    },
    modalContaBodyContent: {
      padding: horizontalPadding,
    },
    modalContaLoading: {
      padding: isSmallScreen ? 32 : 48,
      alignItems: 'center',
    },
    modalContaLoadingText: {
      marginTop: 16,
      fontSize: isSmallScreen ? 14 : 16,
      color: '#666',
    },
    modalContaEmpty: {
      padding: isSmallScreen ? 32 : 48,
      alignItems: 'center',
    },
    modalContaEmptyText: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
      color: '#999',
      marginTop: 16,
    },
    modalContaEmptySubtext: {
      fontSize: isSmallScreen ? 12 : 14,
      color: '#999',
      marginTop: 8,
      textAlign: 'center',
    },
    pedidoContaCard: {
      backgroundColor: '#F9F9F9',
      borderRadius: 12,
      padding: isSmallScreen ? 12 : 16,
      marginBottom: isSmallScreen ? 10 : 12,
      width: '100%',
    },
    pedidoContaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: isSmallScreen ? 8 : 12,
    },
    pedidoContaNumero: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    pedidoContaMesa: {
      fontSize: isSmallScreen ? 12 : 13,
      color: '#666',
      marginBottom: 2,
      fontWeight: '600',
    },
    pedidoContaData: {
      fontSize: isSmallScreen ? 11 : 12,
      color: '#666',
    },
    pedidoContaStatusBadge: {
      paddingHorizontal: isSmallScreen ? 8 : 12,
      paddingVertical: isSmallScreen ? 4 : 6,
      borderRadius: 12,
    },
    pedidoContaStatusText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 11 : 12,
      fontWeight: '600',
    },
    pedidoContaItens: {
      marginBottom: isSmallScreen ? 8 : 12,
    },
    pedidoContaItemText: {
      fontSize: isSmallScreen ? 13 : 14,
      color: '#666',
      marginBottom: 4,
    },
    pedidoContaFooter: {
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      paddingTop: isSmallScreen ? 8 : 12,
      marginTop: 8,
    },
    pedidoContaTotal: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
      color: '#4CAF50',
      textAlign: 'right',
    },
    modalContaFooter: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: isSmallScreen ? 12 : 20,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      backgroundColor: '#FFF',
      width: '100%',
    },
    modalContaTotalContainer: {
      marginBottom: isSmallScreen ? 12 : 16,
      alignItems: 'center',
    },
    modalContaTotalLabel: {
      fontSize: isSmallScreen ? 14 : 16,
      color: '#666',
      marginBottom: 4,
    },
    modalContaTotalValue: {
      fontSize: isSmallScreen ? 28 : 32,
      fontWeight: 'bold',
      color: '#333',
    },
    modalContaPagarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4CAF50',
      paddingVertical: isSmallScreen ? 14 : 16,
      borderRadius: 8,
      gap: 8,
      width: '100%',
    },
    modalContaPagarButtonText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
    },
  });
};

