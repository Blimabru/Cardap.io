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

export default function CarrinhoScreen() {
  // Hook de navegação para mudanças de tela
  const router = useRouter();
  // Funções e estado do contexto do carrinho
  const { itens, quantidadeTotal, valorSubtotal, removerDoCarrinho, atualizarQuantidade, limparCarrinho } = useCarrinho();
  // Estado de autenticação do usuário
  const { autenticado } = useAuth();

  // Estados locais da tela
  const [carregando, setCarregando] = useState(false); // Loading durante criação do pedido
  const [observacoes, setObservacoes] = useState(''); // Observações/comentários do pedido

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

    return (
      <View style={styles.itemCard}>
        <Image source={{ uri: item.produto.imageUrl }} style={styles.itemImage} />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.produto.name}
          </Text>
          <Text style={styles.itemPrice}>R$ {preco.toFixed(2)}</Text>
          
          {item.observacoes && (
            <Text style={styles.itemObs} numberOfLines={1}>
              Obs: {item.observacoes}
            </Text>
          )}
        </View>

        <View style={styles.itemActions}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade - 1)}
              style={styles.quantityButton}
            >
              <Icon name="remove" size={18} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{item.quantidade}</Text>
            
            <TouchableOpacity
              onPress={() => atualizarQuantidade(item.produto.id, item.quantidade + 1)}
              style={styles.quantityButton}
            >
              <Icon name="add" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtotal}>R$ {subtotal.toFixed(2)}</Text>

          <TouchableOpacity
            onPress={() => removerDoCarrinho(item.produto.id)}
            style={styles.removeButton}
          >
            <Icon name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shopping-cart" size={80} color="#DDD" />
      <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.emptyButtonText}>Ver Cardápio</Text>
      </TouchableOpacity>
    </View>
  );

  if (itens.length === 0) {
    return (
      <View style={styles.container}>
        {renderEmpty()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={itens}
        renderItem={renderItem}
        keyExtractor={(item) => item.produto.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.footer}>
            {!autenticado && (
              <View style={styles.loginBanner}>
                <Icon name="info" size={20} color="#2196F3" />
                <View style={styles.loginBannerContent}>
                  <Text style={styles.loginBannerText}>
                    Faça login para salvar seu histórico de pedidos
                  </Text>
                  <TouchableOpacity
                    style={styles.loginBannerButton}
                    onPress={() => router.push('/login')}
                  >
                    <Text style={styles.loginBannerButtonText}>Fazer Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.observacoesContainer}>
              <Text style={styles.observacoesLabel}>Observações do Pedido</Text>
              <TextInput
                style={styles.observacoesInput}
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

      <View style={styles.resumo}>
        <View style={styles.resumoRow}>
          <Text style={styles.resumoLabel}>Subtotal ({quantidadeTotal} itens)</Text>
          <Text style={styles.resumoValue}>R$ {valorSubtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.finalizarButton, carregando && styles.buttonDisabled]}
          onPress={handleFinalizarPedido}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.finalizarButtonText}>Finalizar Pedido</Text>
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
  },
  list: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemObs: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 12,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    marginTop: 8,
  },
  loginBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  loginBannerContent: {
    flex: 1,
  },
  loginBannerText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
    lineHeight: 20,
  },
  loginBannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loginBannerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  observacoesContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  observacoesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  observacoesInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  resumo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resumoLabel: {
    fontSize: 16,
    color: '#666',
  },
  resumoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  finalizarButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  finalizarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

