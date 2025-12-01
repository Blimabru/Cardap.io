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
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { atualizarStatusPedido, cancelarPedido, corDoStatus, formatarStatus, listarMeusPedidos, listarTodosPedidos } from '../../services/pedidos.service';
import { Pedido, StatusPedido } from '../../types';
import HomeHeader from '../../components/HomeHeader';

export default function PedidosScreen() {
  const router = useRouter();
  const { autenticado, podeGerenciar } = useAuth();

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

    return (
      <View style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <View>
            <Text style={styles.pedidoNumero}>Pedido #{item.numero_pedido}</Text>
            {item.mesa && (
              <Text style={styles.pedidoMesa}>Mesa #{item.mesa.numero}</Text>
            )}
            <Text style={styles.pedidoData}>{data} às {hora}</Text>
          </View>
          
          {podeGerenciar ? (
            <TouchableOpacity
              style={[styles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}
              onPress={() => abrirModalStatus(item)}
            >
              <Text style={styles.statusText}>{formatarStatus(item.status)}</Text>
              <Icon name="expand-more" size={16} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}>
              <Text style={styles.statusText}>{formatarStatus(item.status)}</Text>
            </View>
          )}
        </View>

        <View style={styles.pedidoItens}>
          {item.itens.map((itemPedido, index) => (
            <Text key={index} style={styles.itemText}>
              {itemPedido.quantidade}x {itemPedido.produto.name}
            </Text>
          ))}
        </View>

        {item.observacoes && (
          <Text style={styles.observacoes}>Obs: {item.observacoes}</Text>
        )}

        <View style={styles.pedidoFooter}>
          <Text style={styles.total}>Total: R$ {Number(item.total).toFixed(2)}</Text>
          
          {podeCancelar && (
            <TouchableOpacity
              style={styles.cancelarButton}
              onPress={() => handleCancelar(item)}
            >
              <Text style={styles.cancelarText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!autenticado) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="lock" size={80} color="#DDD" />
        <Text style={styles.emptyText}>Faça login para ver seus pedidos</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Fazer Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (pedidos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="receipt-long" size={80} color="#DDD" />
        <Text style={styles.emptyText}>Você ainda não fez nenhum pedido</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.loginButtonText}>Ver Cardápio</Text>
        </TouchableOpacity>
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
        contentContainerStyle={styles.list}
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Atualizar Status</Text>
                <TouchableOpacity onPress={() => setModalStatusVisivel(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <Text style={styles.modalSubtitle}>
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
                      styles.statusOption,
                      pedidoSelecionado?.status === status && styles.statusOptionAtual,
                    ]}
                    onPress={() => handleAtualizarStatus(status)}
                  >
                    <View
                      style={[
                        styles.statusIndicator,
                        { backgroundColor: corDoStatus(status) },
                      ]}
                    />
                    <Text style={styles.statusOptionText}>{formatarStatus(status)}</Text>
                    {pedidoSelecionado?.status === status && (
                      <Icon name="check" size={20} color="#4CAF50" />
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  pedidoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pedidoNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pedidoMesa: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontWeight: '600',
  },
  pedidoData: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  pedidoItens: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  observacoes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  cancelarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal de Status
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  statusOptionAtual: {
    backgroundColor: '#E8F5E9',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

