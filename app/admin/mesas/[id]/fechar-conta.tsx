/**
 * Tela de Fechar Conta da Mesa
 * 
 * Lista pedidos pendentes e calcula total para fechamento
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import * as contasService from '../../../../services/contas.service';
import * as mesasService from '../../../../services/mesas.service';
import { listarPedidosPendentesPorMesa } from '../../../../services/pedidos.service';
import { Mesa, Pedido } from '../../../../types';

export default function FecharContaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { podeGerenciar } = useAuth();
  const mesaId = params.id as string;

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fechando, setFechando] = useState(false);

  useEffect(() => {
    if (podeGerenciar && mesaId) {
      carregarDados();
    }
  }, [mesaId, podeGerenciar]);

  const carregarDados = async () => {
    try {
      const [mesaData, pedidosData] = await Promise.all([
        mesasService.buscarMesaPorId(mesaId),
        listarPedidosPendentesPorMesa(mesaId),
      ]);
      setMesa(mesaData);
      setPedidos(pedidosData);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar os dados');
      router.back();
    } finally {
      setCarregando(false);
    }
  };

  const calcularTotal = (): number => {
    return pedidos.reduce((total, pedido) => total + pedido.total, 0);
  };

  const handleFecharConta = async () => {
    if (pedidos.length === 0) {
      Alert.alert('Atenção', 'Não há pedidos pendentes para fechar a conta');
      return;
    }

    Alert.alert(
      'Fechar Conta',
      `Deseja fechar a conta da Mesa #${mesa?.numero}?\n\nTotal: R$ ${calcularTotal().toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar Conta',
          onPress: async () => {
            try {
              setFechando(true);
              const conta = await contasService.fecharContaMesa({ id_mesa: mesaId });
              Alert.alert(
                'Conta Fechada!',
                `Total: R$ ${conta.total.toFixed(2)}\n\nRedirecionando para pagamento...`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace(`/admin/mesas/${mesaId}/pagamento?conta_id=${conta.id}`);
                    },
                  },
                ]
              );
            } catch (erro: any) {
              Alert.alert('Erro', erro.message || 'Não foi possível fechar a conta');
            } finally {
              setFechando(false);
            }
          },
        },
      ]
    );
  };

  const renderPedido = ({ item }: { item: Pedido }) => {
    return (
      <View style={styles.pedidoCard}>
        <View style={styles.pedidoHeader}>
          <View>
            <Text style={styles.pedidoNumero}>Pedido #{item.numero_pedido}</Text>
            {item.mesa && (
              <Text style={styles.pedidoMesa}>Mesa #{item.mesa.numero}</Text>
            )}
          </View>
          <Text style={styles.pedidoTotal}>R$ {item.total.toFixed(2)}</Text>
        </View>

        <View style={styles.pedidoItens}>
          {item.itens.map((itemPedido, index) => (
            <Text key={index} style={styles.itemText}>
              • {itemPedido.quantidade}x {itemPedido.produto.name} - R$ {itemPedido.subtotal.toFixed(2)}
            </Text>
          ))}
        </View>

        <View style={styles.pedidoDetalhes}>
          <Text style={styles.detalheText}>
            Subtotal: R$ {item.subtotal.toFixed(2)}
          </Text>
          {item.taxa_servico > 0 && (
            <Text style={styles.detalheText}>
              Taxa de Serviço: R$ {item.taxa_servico.toFixed(2)}
            </Text>
          )}
          {item.taxa_entrega > 0 && (
            <Text style={styles.detalheText}>
              Taxa de Entrega: R$ {item.taxa_entrega.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
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

  if (carregando) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!mesa) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={80} color="#DDD" />
        <Text style={styles.errorText}>Mesa não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = calcularTotal();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fechar Conta - Mesa #{mesa.numero}</Text>
        <View style={{ width: 24 }} />
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-long" size={80} color="#DDD" />
          <Text style={styles.emptyText}>Não há pedidos pendentes</Text>
          <Text style={styles.emptySubtext}>A conta desta mesa já está fechada ou não possui pedidos.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={pedidos}
            renderItem={renderPedido}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.lista}
            ListHeaderComponent={() => (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Resumo da Conta</Text>
                <Text style={styles.infoText}>Mesa #{mesa.numero}</Text>
                <Text style={styles.infoText}>{pedidos.length} pedido(s) pendente(s)</Text>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.buttonPrimary, fechando && styles.buttonDisabled]}
              onPress={handleFecharConta}
              disabled={fechando}
            >
              {fechando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Icon name="receipt" size={20} color="#FFF" />
                  <Text style={styles.buttonPrimaryText}>Fechar Conta</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    alignItems: 'center',
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
  pedidoTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pedidoItens: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pedidoDetalhes: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 8,
  },
  detalheText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  totalContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPrimaryText: {
    color: '#FFF',
    fontSize: 18,
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
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
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

