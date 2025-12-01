/**
 * Tela de Pedidos
 * 
 * Lista pedidos do usuário autenticado
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarStatusPedido, cancelarPedido, corDoStatus, formatarStatus, listarMeusPedidos, listarTodosPedidos } from '../../services/pedidos.service';
import { Pedido, StatusPedido } from '../../types';
import HomeHeader from '../../components/HomeHeader';

export default function PedidosScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { autenticado, podeGerenciar } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [modalStatusVisivel, setModalStatusVisivel] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  useEffect(() => {
    if (autenticado) {
      carregarPedidos();
    }
  }, [autenticado, podeGerenciar]);

  const carregarPedidos = async () => {
    try {
      // Se for Admin/Dono, carrega todos os pedidos (incluindo mesas)
      // Caso contrário, carrega apenas os pedidos do usuário
      const dados = podeGerenciar 
        ? await listarTodosPedidos()
        : await listarMeusPedidos();
      setPedidos(dados);
    } catch (erro) {
      console.error('Erro ao carregar pedidos:', erro);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  const abrirModalStatus = (pedido: Pedido) => {
    setPedidoSelecionado(pedido);
    setModalStatusVisivel(true);
  };

  const handleAtualizarStatus = async (novoStatus: StatusPedido) => {
    if (!pedidoSelecionado) return;

    try {
      await atualizarStatusPedido(pedidoSelecionado.id, novoStatus);
      Alert.alert('Sucesso', 'Status atualizado com sucesso!');
      setModalStatusVisivel(false);
      setPedidoSelecionado(null);
      carregarPedidos();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível atualizar o status');
    }
  };

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

    return StyleSheet.create({
      list: {
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      pedidoCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: horizontalPadding,
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
      pedidoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        flexWrap: 'wrap',
      },
      pedidoNumero: {
        fontSize: isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: 'bold',
        color: '#333',
      },
      pedidoMesa: {
        fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
        marginTop: isSmallScreen ? 2 : isMediumScreen ? 2 : isLargeScreen ? 2 : Math.min(2, screenWidth * 0.005),
        fontWeight: '600',
      },
      pedidoData: {
        fontSize: smallFontSize,
        color: '#999',
        marginTop: isSmallScreen ? 2 : isMediumScreen ? 2 : isLargeScreen ? 2 : Math.min(2, screenWidth * 0.005),
      },
      statusBadge: {
        paddingHorizontal: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        paddingVertical: isSmallScreen ? 5 : isMediumScreen ? 5.5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
        borderRadius: 16,
        flexShrink: 0,
        marginLeft: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      statusText: {
        fontSize: smallFontSize,
        fontWeight: '600',
        color: '#FFF',
      },
      pedidoItens: {
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      itemText: {
        fontSize: bodyFontSize,
        color: '#666',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      observacoes: {
        fontSize: smallFontSize,
        color: '#999',
        fontStyle: 'italic',
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      pedidoFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        flexWrap: 'wrap',
      },
      total: {
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        fontWeight: 'bold',
        color: '#333',
      },
      cancelarButton: {
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F44336',
        marginTop: isSmallScreen ? 8 : 0,
      },
      cancelarText: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        fontWeight: '600',
        color: '#F44336',
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        backgroundColor: '#F5F5F5',
      },
      emptyText: {
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        marginBottom: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        textAlign: 'center',
      },
      loginButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      loginButtonText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: horizontalPadding,
      },
      modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        width: '100%',
        maxWidth: isSmallScreen ? screenWidth - (horizontalPadding * 2) : isMediumScreen ? 380 : isLargeScreen ? 400 : Math.min(400, screenWidth * 0.975),
        maxHeight: '80%',
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
      },
      modalTitle: {
        fontSize: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        fontWeight: 'bold',
        color: '#333',
      },
      modalContent: {
        padding: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      },
      modalSubtitle: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#666',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderRadius: 8,
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        backgroundColor: '#F5F5F5',
      },
      statusOptionAtual: {
        backgroundColor: '#E8F5E9',
      },
      statusIndicator: {
        width: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        height: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        borderRadius: isSmallScreen ? 5 : isMediumScreen ? 5.5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
        marginRight: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      statusOptionText: {
        flex: 1,
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#333',
        fontWeight: '500',
      },
      centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen);

  const handleCancelar = (pedido: Pedido) => {
    Alert.alert(
      'Cancelar Pedido',
      `Deseja realmente cancelar o pedido #${pedido.numero_pedido}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarPedido(pedido.id);
              Alert.alert('Sucesso', 'Pedido cancelado com sucesso');
              carregarPedidos();
            } catch (erro: any) {
              Alert.alert('Erro', erro.message || 'Não foi possível cancelar o pedido');
            }
          },
        },
      ]
    );
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    const data = new Date(item.data_criacao).toLocaleDateString('pt-BR');
    const hora = new Date(item.data_criacao).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const podeCancelar = item.status === 'pendente' || item.status === 'confirmado';
    const expandIconSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const checkIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const closeIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);

    return (
      <View style={dynamicStyles.pedidoCard}>
        <View style={dynamicStyles.pedidoHeader}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={dynamicStyles.pedidoNumero}>Pedido #{item.numero_pedido}</Text>
            {item.mesa && (
              <Text style={dynamicStyles.pedidoMesa}>Mesa #{item.mesa.numero}</Text>
            )}
            <Text style={dynamicStyles.pedidoData}>{data} às {hora}</Text>
          </View>
          
          {podeGerenciar ? (
            <TouchableOpacity
              style={[dynamicStyles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}
              onPress={() => abrirModalStatus(item)}
            >
              <Text style={dynamicStyles.statusText}>{formatarStatus(item.status)}</Text>
              <Icon name="expand-more" size={expandIconSize} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <View style={[dynamicStyles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}>
              <Text style={dynamicStyles.statusText}>{formatarStatus(item.status)}</Text>
            </View>
          )}
        </View>

        <View style={dynamicStyles.pedidoItens}>
          {item.itens.map((itemPedido, index) => (
            <Text key={index} style={dynamicStyles.itemText}>
              {itemPedido.quantidade}x {itemPedido.produto.name}
            </Text>
          ))}
        </View>

        {item.observacoes && (
          <Text style={dynamicStyles.observacoes}>Obs: {item.observacoes}</Text>
        )}

        <View style={dynamicStyles.pedidoFooter}>
          <Text style={dynamicStyles.total}>Total: R$ {Number(item.total).toFixed(2)}</Text>
          
          {podeCancelar && (
            <TouchableOpacity
              style={dynamicStyles.cancelarButton}
              onPress={() => handleCancelar(item)}
            >
              <Text style={dynamicStyles.cancelarText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);
  const closeIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const checkIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);

  if (!autenticado) {
    return (
      <View style={styles.container}>
        <HomeHeader />
        <View style={dynamicStyles.emptyContainer}>
          <Icon name="lock" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.emptyText}>Faça login para ver seus pedidos</Text>
          <TouchableOpacity
            style={dynamicStyles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={dynamicStyles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <HomeHeader />
        <View style={dynamicStyles.centerContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      </View>
    );
  }

  if (pedidos.length === 0) {
    return (
      <View style={styles.container}>
        <HomeHeader />
        <View style={dynamicStyles.emptyContainer}>
          <Icon name="receipt-long" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.emptyText}>Você ainda não fez nenhum pedido</Text>
          <TouchableOpacity
            style={dynamicStyles.loginButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={dynamicStyles.loginButtonText}>Ver Cardápio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader />
      <FlatList
        data={pedidos}
        renderItem={renderPedido}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dynamicStyles.list}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregarPedidos();
            }}
          />
        }
      />

      {/* Modal de Atualização de Status (apenas para Admin/Dono) */}
      {podeGerenciar && (
        <Modal
          visible={modalStatusVisivel}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalStatusVisivel(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContainer}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Atualizar Status</Text>
                <TouchableOpacity onPress={() => setModalStatusVisivel(false)}>
                  <Icon name="close" size={closeIconSize} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.modalContent}>
                <Text style={dynamicStyles.modalSubtitle}>
                  Pedido #{pedidoSelecionado?.numero_pedido}
                </Text>
                
                {[
                  StatusPedido.PENDENTE,
                  StatusPedido.CONFIRMADO,
                  StatusPedido.EM_PREPARO,
                  StatusPedido.PRONTO,
                  StatusPedido.SAIU_ENTREGA,
                  StatusPedido.ENTREGUE,
                  StatusPedido.CANCELADO,
                ].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      dynamicStyles.statusOption,
                      pedidoSelecionado?.status === status && dynamicStyles.statusOptionAtual,
                    ]}
                    onPress={() => handleAtualizarStatus(status)}
                  >
                    <View
                      style={[
                        dynamicStyles.statusIndicator,
                        { backgroundColor: corDoStatus(status) },
                      ]}
                    />
                    <Text style={dynamicStyles.statusOptionText}>{formatarStatus(status)}</Text>
                    {pedidoSelecionado?.status === status && (
                      <Icon name="check" size={checkIconSize} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
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
});

