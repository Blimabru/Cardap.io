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
    View,
} from 'react-native';
import { MesaCarrinhoProvider, useMesaCarrinho } from '../../contexts/MesaCarrinhoContext';
import * as categoriasService from '../../services/categorias.service';
import * as pedidosService from '../../services/pedidos.service';
import * as produtosService from '../../services/produtos.service';
import * as qrcodeService from '../../services/qrcode.service';
import { Categoria, Mesa, Produto, TipoPedido } from '../../types';

// Componentes
import CategoryList from '../../components/CategoryList';
import ItemCard from '../../components/ItemCard';
import SearchBar from '../../components/SearchBar';

function MesaCardapioContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrCode = params.qrCode as string;
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
        id_usuario: pedidoCriado.id_usuario,
        status: pedidoCriado.status,
        total: pedidoCriado.total,
      }, null, 2));

      limparCarrinho();
      setObservacoesPedido('');
      setModalCarrinhoAberto(false);

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
          <TouchableOpacity
            style={styles.cartInfoButton}
            onPress={() => setModalCarrinhoAberto(true)}
          >
            <View style={styles.cartInfo}>
              <Icon name="shopping-cart" size={20} color="#4CAF50" />
              <Text style={styles.cartText}>{quantidadeTotal} item(s)</Text>
              <Text style={styles.cartTotal}>R$ {valorSubtotal.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleFinalizarPedido}
            disabled={enviandoPedido}
          >
            {enviandoPedido ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.cartButtonText}>Finalizar</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Carrinho - Mesa #{mesaValidada?.numero}</Text>
              <TouchableOpacity
                onPress={() => setModalCarrinhoAberto(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {itens.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                  <Icon name="shopping-cart" size={60} color="#DDD" />
                  <Text style={styles.emptyCartText}>Carrinho vazio</Text>
                </View>
              ) : (
                <>
                  {itens.map((item) => {
                    const preco = typeof item.produto.price === 'string' 
                      ? parseFloat(item.produto.price) 
                      : item.produto.price;
                    const subtotal = preco * item.quantidade;

                    return (
                      <View key={item.produto.id} style={styles.cartItemModal}>
                        {item.produto.imageUrl ? (
                          <Image 
                            source={{ uri: item.produto.imageUrl }} 
                            style={styles.cartItemImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.cartItemImage, styles.cartItemImagePlaceholder]}>
                            <Icon name="image" size={24} color="#999" />
                          </View>
                        )}
                        <View style={styles.cartItemInfo}>
                          <Text style={styles.cartItemName}>{item.produto.name}</Text>
                          <Text style={styles.cartItemPrice}>R$ {preco.toFixed(2)}</Text>
                          
                          <View style={styles.cartItemQuantity}>
                            <TouchableOpacity
                              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
                              style={styles.quantityButtonModal}
                            >
                              <Icon name="remove" size={18} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.quantityTextModal}>{item.quantidade}</Text>
                            <TouchableOpacity
                              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
                              style={styles.quantityButtonModal}
                            >
                              <Icon name="add" size={18} color="#333" />
                            </TouchableOpacity>
                          </View>

                          <TextInput
                            style={styles.cartItemObservacoes}
                            placeholder="Observações (opcional)"
                            value={item.observacoes || ''}
                            onChangeText={(text) => atualizarObservacoes(item.produto.id, text)}
                            multiline
                          />
                        </View>
                        <View style={styles.cartItemActions}>
                          <Text style={styles.cartItemSubtotal}>R$ {subtotal.toFixed(2)}</Text>
                          <TouchableOpacity
                            onPress={() => removerDoCarrinho(item.produto.id)}
                            style={styles.removeButtonModal}
                          >
                            <Icon name="delete" size={20} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  <View style={styles.observacoesContainer}>
                    <Text style={styles.observacoesLabel}>Observações Gerais do Pedido</Text>
                    <TextInput
                      style={styles.observacoesInput}
                      placeholder="Ex: Sem cebola, ponto da carne..."
                      value={observacoesPedido}
                      onChangeText={setObservacoesPedido}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            {itens.length > 0 && (
              <View style={styles.modalFooter}>
                <View style={styles.modalTotal}>
                  <Text style={styles.modalTotalLabel}>Total ({quantidadeTotal} itens)</Text>
                  <Text style={styles.modalTotalValue}>R$ {valorSubtotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalFinalizarButton, enviandoPedido && styles.buttonDisabled]}
                  onPress={handleFinalizarPedido}
                  disabled={enviandoPedido}
                >
                  {enviandoPedido ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.modalFinalizarButtonText}>Finalizar Pedido</Text>
                  )}
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
  cartInfoButton: {
    flex: 1,
    marginRight: 12,
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  cartTotal: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  cartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cartButtonText: {
    color: '#FFF',
    fontSize: 16,
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
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: '70%',
    padding: 16,
  },
  emptyCartContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  cartItemModal: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  cartItemImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  quantityButtonModal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityTextModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  cartItemObservacoes: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    color: '#666',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 40,
  },
  cartItemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cartItemSubtotal: {
    fontSize: 16,
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
  },
  observacoesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  observacoesInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalFinalizarButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalFinalizarButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

