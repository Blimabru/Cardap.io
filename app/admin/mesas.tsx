/**
 * Tela de Gerenciamento de Mesas
 * 
 * Admin e Dono gerenciam mesas do restaurante
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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Mesa, StatusMesa } from '../../types';
import * as mesasService from '../../services/mesas.service';
import { listarPedidosPendentesPorMesa } from '../../services/pedidos.service';

export default function MesasScreen() {
  const router = useRouter();
  const { podeGerenciar } = useAuth();

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [modalCriarVisivel, setModalCriarVisivel] = useState(false);
  const [modalStatusVisivel, setModalStatusVisivel] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [numeroNovaMesa, setNumeroNovaMesa] = useState('');
  const [capacidadeNovaMesa, setCapacidadeNovaMesa] = useState('4');

  useEffect(() => {
    if (podeGerenciar) {
      carregarMesas();
    }
  }, [podeGerenciar]);

  const carregarMesas = async () => {
    try {
      const dados = await mesasService.listarMesas();
      setMesas(dados);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar mesas');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  const handleCriarMesa = async () => {
    if (!numeroNovaMesa.trim()) {
      Alert.alert('Atenção', 'Informe o número da mesa');
      return;
    }

    const numero = parseInt(numeroNovaMesa);
    if (isNaN(numero) || numero <= 0) {
      Alert.alert('Atenção', 'Número da mesa deve ser um número positivo');
      return;
    }

    const capacidade = parseInt(capacidadeNovaMesa) || 4;

    try {
      await mesasService.criarMesa({
        numero,
        capacidade,
      });
      Alert.alert('Sucesso', 'Mesa criada com sucesso!');
      setModalCriarVisivel(false);
      setNumeroNovaMesa('');
      setCapacidadeNovaMesa('4');
      carregarMesas();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível criar a mesa');
    }
  };

  const abrirModalStatus = (mesa: Mesa) => {
    setMesaSelecionada(mesa);
    setModalStatusVisivel(true);
  };

  const handleAtualizarStatus = async (novoStatus: StatusMesa) => {
    if (!mesaSelecionada) return;

    try {
      await mesasService.atualizarStatusMesa(mesaSelecionada.id, novoStatus);
      Alert.alert('Sucesso', 'Status atualizado com sucesso!');
      setModalStatusVisivel(false);
      setMesaSelecionada(null);
      carregarMesas();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível atualizar o status');
    }
  };

  const handleVerQRCode = (mesa: Mesa) => {
    router.push(`/admin/mesas/${mesa.id}/qrcode`);
  };

  const handleFecharConta = async (mesa: Mesa) => {
    try {
      const pedidos = await listarPedidosPendentesPorMesa(mesa.id);
      if (pedidos.length === 0) {
        Alert.alert('Atenção', 'Não há pedidos pendentes nesta mesa');
        return;
      }
      router.push(`/admin/mesas/${mesa.id}/fechar-conta`);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível verificar pedidos');
    }
  };

  const formatarStatus = (status: StatusMesa): string => {
    const statusMap: Record<StatusMesa, string> = {
      [StatusMesa.LIVRE]: 'Livre',
      [StatusMesa.OCUPADA]: 'Ocupada',
      [StatusMesa.RESERVADA]: 'Reservada',
      [StatusMesa.INATIVA]: 'Inativa',
    };
    return statusMap[status] || status;
  };

  const corDoStatus = (status: StatusMesa): string => {
    const coresMap: Record<StatusMesa, string> = {
      [StatusMesa.LIVRE]: '#4CAF50',
      [StatusMesa.OCUPADA]: '#FF9800',
      [StatusMesa.RESERVADA]: '#2196F3',
      [StatusMesa.INATIVA]: '#9E9E9E',
    };
    return coresMap[status] || '#757575';
  };

  const renderMesa = ({ item }: { item: Mesa }) => {
    return (
      <View style={styles.mesaCard}>
        <View style={styles.mesaHeader}>
          <View>
            <Text style={styles.mesaNumero}>Mesa #{item.numero}</Text>
            <Text style={styles.mesaInfo}>Capacidade: {item.capacidade} pessoas</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}
            onPress={() => abrirModalStatus(item)}
          >
            <Text style={styles.statusText}>{formatarStatus(item.status)}</Text>
            <Icon name="expand-more" size={16} color="#FFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.mesaActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleVerQRCode(item)}
          >
            <Icon name="qr-code-2" size={20} color="#2196F3" />
            <Text style={styles.actionText}>Ver QR Code</Text>
          </TouchableOpacity>

          {item.status === StatusMesa.OCUPADA && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => handleFecharConta(item)}
            >
              <Icon name="receipt" size={20} color="#4CAF50" />
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Fechar Conta</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderModalCriar = () => {
    return (
      <Modal
        visible={modalCriarVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCriarVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Mesa</Text>
              <TouchableOpacity onPress={() => setModalCriarVisivel(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.label}>Número da Mesa *</Text>
              <TextInput
                style={styles.input}
                value={numeroNovaMesa}
                onChangeText={setNumeroNovaMesa}
                placeholder="Ex: 1, 2, 3..."
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Capacidade</Text>
              <TextInput
                style={styles.input}
                value={capacidadeNovaMesa}
                onChangeText={setCapacidadeNovaMesa}
                placeholder="4"
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleCriarMesa}
              >
                <Text style={styles.buttonPrimaryText}>Criar Mesa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderModalStatus = () => {
    if (!mesaSelecionada) return null;

    const statusOptions: StatusMesa[] = [
      StatusMesa.LIVRE,
      StatusMesa.OCUPADA,
      StatusMesa.RESERVADA,
      StatusMesa.INATIVA,
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
                Mesa #{mesaSelecionada.numero}
              </Text>
              
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    mesaSelecionada.status === status && styles.statusOptionAtual,
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
                  {mesaSelecionada.status === status && (
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
        <Text style={styles.headerTitle}>Gerenciar Mesas</Text>
        <TouchableOpacity onPress={() => setModalCriarVisivel(true)}>
          <Icon name="add" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={mesas}
          renderItem={renderMesa}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="table-restaurant" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Nenhuma mesa cadastrada</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => {
                setAtualizando(true);
                carregarMesas();
              }}
            />
          }
        />
      )}

      {renderModalCriar()}
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
  mesaCard: {
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
  mesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mesaNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mesaInfo: {
    fontSize: 14,
    color: '#666',
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
  mesaActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  actionButtonPrimary: {
    backgroundColor: '#E8F5E9',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  actionTextPrimary: {
    color: '#4CAF50',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  buttonPrimary: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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

