/**
 * Tela de Todos os Pedidos
 * 
 * Admin e Dono veem e gerenciam todos os pedidos do sistema
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Pedido, StatusPedido } from '../../types';
import { 
  listarTodosPedidos, 
  atualizarStatusPedido, 
  formatarStatus, 
  corDoStatus 
} from '../../services/pedidos.service';

export default function TodosPedidosScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { podeGerenciar } = useAuth();

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
    if (podeGerenciar) {
      carregarPedidos();
    }
  }, [podeGerenciar]);

  const carregarPedidos = async () => {
    try {
      const dados = await listarTodosPedidos();
      setPedidos(dados);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar pedidos');
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
    const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044);
    const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const labelFontSize = isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    const smallFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);
    const largeFontSize = isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044);

    // Tamanhos de ícones responsivos
    const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);
    const statusIconSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);

    return StyleSheet.create({
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: horizontalPadding,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      headerTitle: {
        fontSize: titleFontSize,
        fontWeight: 'bold',
        color: '#333',
      },
      lista: {
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
      },
      pedidoNumero: {
        fontSize: isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: 'bold',
        color: '#333',
      },
      pedidoCliente: {
        fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
        marginTop: isSmallScreen ? 2 : isMediumScreen ? 2 : isLargeScreen ? 2 : Math.min(2, screenWidth * 0.005),
      },
      pedidoData: {
        fontSize: smallFontSize,
        color: '#999',
        marginTop: isSmallScreen ? 2 : isMediumScreen ? 2 : isLargeScreen ? 2 : Math.min(2, screenWidth * 0.005),
      },
      statusBadge: {
        flexDirection: 'row',
        paddingHorizontal: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        paddingVertical: isSmallScreen ? 5 : isMediumScreen ? 5.5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
        borderRadius: 16,
        alignItems: 'center',
      },
      statusText: {
        fontSize: smallFontSize,
        fontWeight: '600',
        color: '#FFF',
      },
      pedidoItens: {
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      itensLabel: {
        fontSize: labelFontSize,
        fontWeight: '600',
        color: '#666',
        marginBottom: isSmallScreen ? 5 : isMediumScreen ? 5.5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
      },
      itemText: {
        fontSize: labelFontSize,
        color: '#666',
        marginBottom: isSmallScreen ? 2 : isMediumScreen ? 2.5 : isLargeScreen ? 3 : Math.min(3, screenWidth * 0.007),
      },
      observacoesContainer: {
        backgroundColor: '#F9F9F9',
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        borderRadius: 8,
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        width: '100%',
        maxWidth: '100%',
      },
      observacoesLabel: {
        fontSize: smallFontSize,
        fontWeight: '600',
        color: '#666',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      observacoes: {
        fontSize: smallFontSize,
        color: '#999',
        fontStyle: 'italic',
      },
      pedidoFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        width: '100%',
        maxWidth: '100%',
      },
      total: {
        fontSize: largeFontSize,
        fontWeight: 'bold',
        color: '#333',
      },
      tipoPedido: {
        fontSize: smallFontSize,
        color: '#666',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        paddingVertical: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
        borderRadius: 4,
      },
      emptyContainer: {
        padding: isSmallScreen ? 36 : isMediumScreen ? 42 : isLargeScreen ? 48 : Math.min(48, screenWidth * 0.117),
        alignItems: 'center',
      },
      emptyText: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        textAlign: 'center',
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      },
      modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        width: '100%',
        maxWidth: '100%',
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: horizontalPadding,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      modalTitle: {
        fontSize: titleFontSize,
        fontWeight: 'bold',
        color: '#333',
      },
      modalContent: {
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      modalSubtitle: {
        fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        width: '100%',
        maxWidth: '100%',
      },
      statusOptionAtual: {
        backgroundColor: '#F9F9F9',
      },
      statusIndicator: {
        width: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        height: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        borderRadius: isSmallScreen ? 5 : isMediumScreen ? 5.5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
        marginRight: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      statusOptionText: {
        flex: 1,
        fontSize: bodyFontSize,
        color: '#333',
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
      },
      errorText: {
        fontSize: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        fontWeight: 'bold',
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        textAlign: 'center',
      },
      linkText: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#2196F3',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen);

  // Tamanhos de ícones dinâmicos
  const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
  const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);
  const statusIconSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);

  const renderPedido = ({ item }: { item: Pedido }) => {
    const data = new Date(item.data_criacao).toLocaleDateString('pt-BR');
    const hora = new Date(item.data_criacao).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={dynamicStyles.pedidoCard}>
        <View style={dynamicStyles.pedidoHeader}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={dynamicStyles.pedidoNumero}>Pedido #{item.numero_pedido}</Text>
            {item.mesa ? (
              <Text style={dynamicStyles.pedidoCliente}>Mesa #{item.mesa.numero}</Text>
            ) : (
              <Text style={dynamicStyles.pedidoCliente}>
                {item.usuario?.nome_completo || 'Cliente não identificado'}
              </Text>
            )}
            <Text style={dynamicStyles.pedidoData}>{data} às {hora}</Text>
          </View>
          
          <TouchableOpacity
            style={[dynamicStyles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}
            onPress={() => abrirModalStatus(item)}
          >
            <Text style={dynamicStyles.statusText}>{formatarStatus(item.status)}</Text>
            <Icon name="expand-more" size={statusIconSize} color="#FFF" style={{ marginLeft: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010) }} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.pedidoItens}>
          <Text style={dynamicStyles.itensLabel}>Itens do Pedido:</Text>
          {item.itens.map((itemPedido, index) => (
            <Text key={index} style={dynamicStyles.itemText}>
              • {itemPedido.quantidade}x {itemPedido.produto.name} - R$ {Number(itemPedido.subtotal).toFixed(2)}
            </Text>
          ))}
        </View>

        {item.observacoes && (
          <View style={dynamicStyles.observacoesContainer}>
            <Text style={dynamicStyles.observacoesLabel}>Observações:</Text>
            <Text style={dynamicStyles.observacoes}>{item.observacoes}</Text>
          </View>
        )}

        <View style={dynamicStyles.pedidoFooter}>
          <Text style={dynamicStyles.total}>Total: R$ {Number(item.total).toFixed(2)}</Text>
          <Text style={dynamicStyles.tipoPedido}>{item.tipo_pedido.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  const renderModalStatus = () => {
    if (!pedidoSelecionado) return null;

    const statusOptions: StatusPedido[] = [
      StatusPedido.PENDENTE,
      StatusPedido.CONFIRMADO,
      StatusPedido.EM_PREPARO,
      StatusPedido.PRONTO,
      StatusPedido.SAIU_ENTREGA,
      StatusPedido.ENTREGUE,
      StatusPedido.CANCELADO,
    ];

    return (
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
                <Icon name="close" size={modalIconSize} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalSubtitle}>
                Pedido #{pedidoSelecionado.numero_pedido}
              </Text>
              
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    dynamicStyles.statusOption,
                    pedidoSelecionado.status === status && dynamicStyles.statusOptionAtual,
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
                  {pedidoSelecionado.status === status && (
                    <Icon name="check" size={actionIconSize} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (!podeGerenciar) {
    return (
      <View style={styles.container}>
        <View style={dynamicStyles.errorContainer}>
          <Icon name="block" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.errorText}>Acesso Negado</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={dynamicStyles.linkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={headerIconSize} color="#333" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Todos os Pedidos</Text>
        <View style={{ width: headerIconSize }} />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078) }} />
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderPedido}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.lista}
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <Icon name="receipt-long" size={emptyIconSize} color="#DDD" />
              <Text style={dynamicStyles.emptyText}>Nenhum pedido ainda</Text>
            </View>
          )}
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
      )}

      {renderModalStatus()}
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

