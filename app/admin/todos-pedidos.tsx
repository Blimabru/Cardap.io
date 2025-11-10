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
  const { podeGerenciar } = useAuth();

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

  const renderPedido = ({ item }: { item: Pedido }) => {
    const data = new Date(item.data_criacao).toLocaleDateString('pt-BR');
    const hora = new Date(item.data_criacao).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <View>
            <Text style={styles.pedidoNumero}>Pedido #{item.numero_pedido}</Text>
            <Text style={styles.pedidoCliente}>{item.usuario.nome_completo}</Text>
            <Text style={styles.pedidoData}>{data} às {hora}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}
            onPress={() => abrirModalStatus(item)}
          >
            <Text style={styles.statusText}>{formatarStatus(item.status)}</Text>
            <Icon name="expand-more" size={16} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.pedidoItens}>
          <Text style={styles.itensLabel}>Itens do Pedido:</Text>
          {item.itens.map((itemPedido, index) => (
            <Text key={index} style={styles.itemText}>
              • {itemPedido.quantidade}x {itemPedido.produto.name} - R$ {Number(itemPedido.subtotal).toFixed(2)}
            </Text>
          ))}
        </View>

        {item.observacoes && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesLabel}>Observações:</Text>
            <Text style={styles.observacoes}>{item.observacoes}</Text>
          </View>
        )}

        <View style={styles.pedidoFooter}>
          <Text style={styles.total}>Total: R$ {Number(item.total).toFixed(2)}</Text>
          <Text style={styles.tipoPedido}>{item.tipo_pedido.toUpperCase()}</Text>
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
                Pedido #{pedidoSelecionado.numero_pedido}
              </Text>
              
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    pedidoSelecionado.status === status && styles.statusOptionAtual,
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
                  {pedidoSelecionado.status === status && (
                    <Icon name="check" size={20} color="#4CAF50" />
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
      <View style={styles.errorContainer}>
        <Icon name="block" size={80} color="#DDD" />
        <Text style={styles.errorText}>Acesso Negado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Todos os Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderPedido}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="receipt-long" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Nenhum pedido ainda</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lista: {
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
  pedidoCliente: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pedidoData: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  pedidoItens: {
    marginBottom: 12,
  },
  itensLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  observacoesContainer: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  observacoesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  observacoes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
  tipoPedido: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statusOptionAtual: {
    backgroundColor: '#F9F9F9',
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#2196F3',
    marginTop: 16,
  },
});

