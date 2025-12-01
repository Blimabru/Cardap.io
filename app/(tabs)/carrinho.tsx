/**
 * ============================================================================
 * CARRINHO.TSX - TELA DO CARRINHO DE COMPRAS
 * ============================================================================
 * 
 * Esta tela exibe os itens adicionados ao carrinho e permite finalizar pedidos.
 * 
 * FUNCIONALIDADES PRINCIPAIS:
 * - Visualização de itens no carrinho com quantidades
 * - Ajuste de quantidade (+ / -)
 * - Remoção de itens do carrinho
 * - Cálculo automático de subtotais e total
 * - Finalização de pedido (com/sem login)
 * - Campo de observações do pedido
 * - Navegação para login se necessário
 * 
 * FLUXO DE FINALIZAÇÃO:
 * 1. Usuário revisa itens no carrinho
 * 2. Adiciona observações (opcional)
 * 3. Clica "Finalizar Pedido"
 * 4. Se não logado: oferece opção de login ou continuar como visitante
 * 5. Cria pedido via service
 * 6. Limpa carrinho e navega para pedidos
 * 
 * ESTADO GERENCIADO:
 * - Loading durante criação do pedido
 * - Observações do pedido
 * - Integração com contextos de Carrinho e Auth
 */

import React, { useState } from 'react';
// Componentes básicos do React Native
import {
  ActivityIndicator, // Componente de imagem
  Alert, // Estilos otimizados
  FlatList, // Botão tocável com feedback
  Image, // Componente de texto
  StyleSheet, // Container básico
  Text, // Indicador de carregamento
  TextInput, // Lista otimizada para performance
  TouchableOpacity,
  useWindowDimensions, // Hook para dimensões da tela
  View, // Container básico
} from 'react-native';
// Hook de navegação do Expo Router
import { useRouter } from 'expo-router';
// Ícones Material Design
import { MaterialIcons as Icon } from '@expo/vector-icons';
// Contextos globais para estado da aplicação
import { useAuth } from '../../contexts/AuthContext';
import { useCarrinho } from '../../contexts/CarrinhoContext';
// Tipos TypeScript
import { ItemCarrinho, TipoPedido } from '../../types';
// Service para comunicação com API
import { criarPedido } from '../../services/pedidos.service';
// Componente de header
import HomeHeader from '../../components/HomeHeader';

export default function CarrinhoScreen() {
  // Hook de navegação para mudanças de tela
  const router = useRouter();
  // Dimensões da tela para responsividade
  const { width: screenWidth } = useWindowDimensions();
  // Funções e estado do contexto do carrinho
  const { itens, quantidadeTotal, valorSubtotal, removerDoCarrinho, atualizarQuantidade, limparCarrinho } = useCarrinho();
  // Estado de autenticação do usuário
  const { autenticado } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

  // Estados locais da tela
  const [carregando, setCarregando] = useState(false); // Loading durante criação do pedido
  const [observacoes, setObservacoes] = useState(''); // Observações/comentários do pedido

  // Função para criar estilos dinâmicos baseados no tamanho da tela
  const createDynamicStyles = (
    screenWidth: number,
    isSmallScreen: boolean,
    isMediumScreen: boolean,
    isLargeScreen: boolean
  ) => {
    // Padding horizontal responsivo
    const horizontalPadding = isSmallScreen 
      ? 12 
      : isMediumScreen 
      ? 14 
      : isLargeScreen
      ? 16
      : Math.min(16, screenWidth * 0.039);

    // Tamanhos de fonte responsivos
    const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const labelFontSize = isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    const smallFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);

    // Tamanhos de imagem responsivos
    const imageSize = isSmallScreen ? 60 : isMediumScreen ? 65 : isLargeScreen ? 70 : Math.min(70, screenWidth * 0.17);

    return StyleSheet.create({
      list: {
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      itemCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      },
      itemImage: {
        width: imageSize,
        height: imageSize,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
        flexShrink: 0,
      },
      itemInfo: {
        flex: 1,
        marginLeft: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        justifyContent: 'center',
        minWidth: 0,
      },
      itemName: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 15 : Math.min(15, screenWidth * 0.036),
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      itemPrice: {
        fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
      },
      itemObs: {
        fontSize: smallFontSize,
        color: '#999',
        fontStyle: 'italic',
        marginTop: isSmallScreen ? 2 : isMediumScreen ? 2 : isLargeScreen ? 2 : Math.min(2, screenWidth * 0.005),
      },
      itemActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginLeft: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        flexShrink: 0,
      },
      quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      quantityButton: {
        width: isSmallScreen ? 24 : isMediumScreen ? 26 : isLargeScreen ? 28 : Math.min(28, screenWidth * 0.068),
        height: isSmallScreen ? 24 : isMediumScreen ? 26 : isLargeScreen ? 28 : Math.min(28, screenWidth * 0.068),
        justifyContent: 'center',
        alignItems: 'center',
      },
      quantity: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 15 : Math.min(15, screenWidth * 0.036),
        fontWeight: '600',
        color: '#333',
        paddingHorizontal: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      subtotal: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: 'bold',
        color: '#333',
        marginTop: isSmallScreen ? 4 : isMediumScreen ? 5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
      },
      removeButton: {
        padding: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
        marginTop: isSmallScreen ? 4 : isMediumScreen ? 5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
      },
      footer: {
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      loginBanner: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        alignItems: 'flex-start',
        gap: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      loginBannerContent: {
        flex: 1,
        minWidth: 0,
      },
      loginBannerText: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#1976D2',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        lineHeight: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      },
      loginBannerButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#2196F3',
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        borderRadius: 6,
      },
      loginBannerButtonText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        fontWeight: '600',
      },
      observacoesContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      observacoesLabel: {
        fontSize: labelFontSize,
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      observacoesInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        fontSize: bodyFontSize,
        color: '#333',
        minHeight: isSmallScreen ? 70 : isMediumScreen ? 75 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195),
        textAlignVertical: 'top',
        width: '100%',
        maxWidth: '100%',
      },
      resumo: {
        backgroundColor: '#FFF',
        padding: horizontalPadding,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      resumoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      resumoLabel: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#666',
      },
      resumoValue: {
        fontSize: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        fontWeight: 'bold',
        color: '#333',
      },
      finalizarButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        alignItems: 'center',
        width: '100%',
      },
      finalizarButtonText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
      },
      emptyText: {
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        marginBottom: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        textAlign: 'center',
      },
      emptyButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      emptyButtonText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
      },
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen);

  const handleFinalizarPedido = async () => {
    if (itens.length === 0) {
      Alert.alert('Atenção', 'Seu carrinho está vazio');
      return;
    }

    // Se não está autenticado, oferecer opções
    if (!autenticado) {
      Alert.alert(
        'Finalizar Pedido',
        'Você está navegando como visitante. Deseja fazer login para salvar seu histórico de pedidos?',
        [
          { 
            text: 'Continuar como Visitante', 
            style: 'cancel',
            onPress: () => {
              Alert.alert(
                'Atenção',
                'Para finalizar um pedido, você precisa estar em uma mesa (via QR code) ou fazer login.\n\nEscaneie o QR code de uma mesa para fazer pedidos.',
                [{ text: 'OK' }]
              );
            }
          },
          { 
            text: 'Fazer Login', 
            onPress: () => router.push('/login')
          },
        ]
      );
      return;
    }

    // Se autenticado, criar pedido normalmente
    setCarregando(true);
    try {
      await criarPedido({
        itens: itens.map(item => ({
          id_produto: item.produto.id,
          quantidade: item.quantidade,
          observacoes: item.observacoes,
        })),
        tipo_pedido: TipoPedido.LOCAL,
        observacoes: observacoes || undefined,
      });

      limparCarrinho();
      
      Alert.alert(
        'Pedido Realizado!',
        'Seu pedido foi enviado com sucesso',
        [
          { text: 'Ver Pedidos', onPress: () => router.push('/(tabs)/pedidos') },
          { text: 'OK' },
        ]
      );
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível finalizar o pedido');
    } finally {
      setCarregando(false);
    }
  };

  const renderItem = ({ item }: { item: ItemCarrinho }) => {
    const preco = typeof item.produto.price === 'string' 
      ? parseFloat(item.produto.price) 
      : item.produto.price;
    const subtotal = preco * item.quantidade;

    // Tamanhos de ícone responsivos
    const iconSize = isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044);
    const deleteIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);

    return (
      <View style={dynamicStyles.itemCard}>
        <Image source={{ uri: item.produto.imageUrl }} style={dynamicStyles.itemImage} />
        
        <View style={dynamicStyles.itemInfo}>
          <Text style={dynamicStyles.itemName} numberOfLines={1}>
            {item.produto.name}
          </Text>
          <Text style={dynamicStyles.itemPrice}>R$ {preco.toFixed(2)}</Text>
          
          {item.observacoes && (
            <Text style={dynamicStyles.itemObs} numberOfLines={1}>
              Obs: {item.observacoes}
            </Text>
          )}
        </View>

        <View style={dynamicStyles.itemActions}>
          <View style={dynamicStyles.quantityContainer}>
            <TouchableOpacity
              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
              style={dynamicStyles.quantityButton}
            >
              <Icon name="remove" size={iconSize} color="#333" />
            </TouchableOpacity>
            
            <Text style={dynamicStyles.quantity}>{item.quantidade}</Text>
            
            <TouchableOpacity
              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
              style={dynamicStyles.quantityButton}
            >
              <Icon name="add" size={iconSize} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={dynamicStyles.subtotal}>R$ {subtotal.toFixed(2)}</Text>

          <TouchableOpacity
            onPress={() => removerDoCarrinho(item.produto.id)}
            style={dynamicStyles.removeButton}
          >
            <Icon name="delete" size={deleteIconSize} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);
    return (
      <View style={dynamicStyles.emptyContainer}>
        <Icon name="shopping-cart" size={emptyIconSize} color="#DDD" />
        <Text style={dynamicStyles.emptyText}>Seu carrinho está vazio</Text>
        <TouchableOpacity
          style={dynamicStyles.emptyButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={dynamicStyles.emptyButtonText}>Ver Cardápio</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (itens.length === 0) {
    return (
      <View style={styles.container}>
        <HomeHeader />
        {renderEmpty()}
      </View>
    );
  }

  const infoIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);

  return (
    <View style={styles.container}>
      <HomeHeader />
      <FlatList
        data={itens}
        renderItem={renderItem}
        keyExtractor={(item) => item.produto.id}
        contentContainerStyle={dynamicStyles.list}
        ListFooterComponent={
          <View style={dynamicStyles.footer}>
            {!autenticado && (
              <View style={dynamicStyles.loginBanner}>
                <Icon name="info" size={infoIconSize} color="#2196F3" />
                <View style={dynamicStyles.loginBannerContent}>
                  <Text style={dynamicStyles.loginBannerText}>
                    Faça login para salvar seu histórico de pedidos
                  </Text>
                  <TouchableOpacity
                    style={dynamicStyles.loginBannerButton}
                    onPress={() => router.push('/login')}
                  >
                    <Text style={dynamicStyles.loginBannerButtonText}>Fazer Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={dynamicStyles.observacoesContainer}>
              <Text style={dynamicStyles.observacoesLabel}>Observações do Pedido</Text>
              <TextInput
                style={dynamicStyles.observacoesInput}
                placeholder="Ex: Sem cebola, ponto da carne..."
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        }
      />

      <View style={dynamicStyles.resumo}>
        <View style={dynamicStyles.resumoRow}>
          <Text style={dynamicStyles.resumoLabel}>Subtotal ({quantidadeTotal} itens)</Text>
          <Text style={dynamicStyles.resumoValue}>R$ {valorSubtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[dynamicStyles.finalizarButton, carregando && styles.buttonDisabled]}
          onPress={handleFinalizarPedido}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={dynamicStyles.finalizarButtonText}>Finalizar Pedido</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

