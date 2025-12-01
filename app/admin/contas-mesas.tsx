/**
 * Tela de Gestão de Contas das Mesas
 * 
 * Admin e Dono gerenciam todas as contas das mesas
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
import { ContaMesa, StatusConta, FormaPagamento } from '../../types';
import * as contasService from '../../services/contas.service';

export default function ContasMesasScreen() {
  const router = useRouter();
  const { podeGerenciar } = useAuth();

  const [contas, setContas] = useState<ContaMesa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'abertas' | 'fechadas' | 'pagas'>('todos');
  const [modalDetalhesVisivel, setModalDetalhesVisivel] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaMesa | null>(null);

  useEffect(() => {
    if (podeGerenciar) {
      carregarContas();
    }
  }, [podeGerenciar, filtroStatus]);

  const carregarContas = async () => {
    try {
      let dados: ContaMesa[] = [];
      
      if (filtroStatus === 'abertas') {
        dados = await contasService.listarContasAbertas();
      } else if (filtroStatus === 'fechadas' || filtroStatus === 'pagas') {
        dados = await contasService.listarContasFechadas();
        if (filtroStatus === 'pagas') {
          dados = dados.filter(c => c.status === StatusConta.PAGA);
        } else {
          dados = dados.filter(c => c.status === StatusConta.FECHADA);
        }
      } else {
        // Todos: buscar abertas e fechadas
        const [abertas, fechadas] = await Promise.all([
          contasService.listarContasAbertas(),
          contasService.listarContasFechadas(),
        ]);
        dados = [...abertas, ...fechadas].sort((a, b) => {
          const dataA = new Date(a.data_abertura).getTime();
          const dataB = new Date(b.data_abertura).getTime();
          return dataB - dataA;
        });
      }
      
      setContas(dados);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar contas');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  };

  const formatarStatus = (status: StatusConta): string => {
    const statusMap: Record<StatusConta, string> = {
      [StatusConta.ABERTA]: 'Aberta',
      [StatusConta.FECHADA]: 'Fechada',
      [StatusConta.PAGA]: 'Paga',
      [StatusConta.CANCELADA]: 'Cancelada',
    };
    return statusMap[status] || status;
  };

  const corDoStatus = (status: StatusConta): string => {
    const coresMap: Record<StatusConta, string> = {
      [StatusConta.ABERTA]: '#FF9800',
      [StatusConta.FECHADA]: '#2196F3',
      [StatusConta.PAGA]: '#4CAF50',
      [StatusConta.CANCELADA]: '#F44336',
    };
    return coresMap[status] || '#757575';
  };

  const formatarFormaPagamento = (forma?: FormaPagamento): string => {
    if (!forma) return 'Não informado';
    const formasMap: Record<FormaPagamento, string> = {
      [FormaPagamento.CARTAO_CREDITO]: 'Cartão de Crédito',
      [FormaPagamento.CARTAO_DEBITO]: 'Cartão de Débito',
      [FormaPagamento.PIX]: 'PIX',
      [FormaPagamento.DINHEIRO]: 'Dinheiro',
    };
    return formasMap[forma] || forma;
  };

  const abrirModalDetalhes = (conta: ContaMesa) => {
    setContaSelecionada(conta);
    setModalDetalhesVisivel(true);
  };

  const handleMarcarComoPaga = async (conta: ContaMesa) => {
    if (conta.status !== StatusConta.FECHADA) {
      Alert.alert('Atenção', 'Apenas contas fechadas podem ser marcadas como pagas');
      return;
    }

    Alert.alert(
      'Marcar como Paga',
      `Deseja marcar a conta da Mesa #${conta.mesa?.numero} como paga?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await contasService.finalizarPagamento({
                conta_id: conta.id,
                forma_pagamento: FormaPagamento.DINHEIRO, // Default para dinheiro se não especificado
              });
              Alert.alert('Sucesso', 'Conta marcada como paga');
              carregarContas();
            } catch (erro: any) {
              Alert.alert('Erro', erro.message || 'Não foi possível marcar como paga');
            }
          },
        },
      ]
    );
  };

  const renderConta = ({ item }: { item: ContaMesa }) => {
    const dataAbertura = new Date(item.data_abertura).toLocaleDateString('pt-BR');
    const dataFechamento = item.data_fechamento 
      ? new Date(item.data_fechamento).toLocaleDateString('pt-BR')
      : null;

    return (
      <TouchableOpacity
        style={styles.contaCard}
        onPress={() => abrirModalDetalhes(item)}
      >
        <View style={styles.contaHeader}>
          <View>
            <Text style={styles.contaMesaNumero}>Mesa #{item.mesa?.numero}</Text>
            <Text style={styles.contaData}>
              {dataFechamento ? `Fechada em ${dataFechamento}` : `Aberta em ${dataAbertura}`}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}>
            <Text style={styles.statusText}>{formatarStatus(item.status)}</Text>
          </View>
        </View>

        <View style={styles.contaInfo}>
          <View style={styles.contaInfoRow}>
            <Text style={styles.contaInfoLabel}>Total:</Text>
            <Text style={styles.contaInfoValue}>R$ {item.total.toFixed(2)}</Text>
          </View>
          {item.forma_pagamento && (
            <View style={styles.contaInfoRow}>
              <Text style={styles.contaInfoLabel}>Pagamento:</Text>
              <Text style={styles.contaInfoValue}>{formatarFormaPagamento(item.forma_pagamento)}</Text>
            </View>
          )}
        </View>

        {item.status === StatusConta.FECHADA && (
          <TouchableOpacity
            style={styles.marcarPagaButton}
            onPress={() => handleMarcarComoPaga(item)}
          >
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.marcarPagaButtonText}>Marcar como Paga</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderModalDetalhes = () => {
    if (!contaSelecionada) return null;

    return (
      <Modal
        visible={modalDetalhesVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDetalhesVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Detalhes - Mesa #{contaSelecionada.mesa?.numero}
              </Text>
              <TouchableOpacity
                onPress={() => setModalDetalhesVisivel(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: corDoStatus(contaSelecionada.status) }]}>
                  <Text style={styles.statusText}>{formatarStatus(contaSelecionada.status)}</Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Total:</Text>
                <Text style={styles.modalInfoValue}>R$ {contaSelecionada.total.toFixed(2)}</Text>
              </View>

              {contaSelecionada.forma_pagamento && (
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Forma de Pagamento:</Text>
                  <Text style={styles.modalInfoValue}>
                    {formatarFormaPagamento(contaSelecionada.forma_pagamento)}
                  </Text>
                </View>
              )}

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Data de Abertura:</Text>
                <Text style={styles.modalInfoValue}>
                  {new Date(contaSelecionada.data_abertura).toLocaleString('pt-BR')}
                </Text>
              </View>

              {contaSelecionada.data_fechamento && (
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Data de Fechamento:</Text>
                  <Text style={styles.modalInfoValue}>
                    {new Date(contaSelecionada.data_fechamento).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}

              {contaSelecionada.data_pagamento && (
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Data de Pagamento:</Text>
                  <Text style={styles.modalInfoValue}>
                    {new Date(contaSelecionada.data_pagamento).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}

              {contaSelecionada.observacoes && (
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Observações:</Text>
                  <Text style={styles.modalInfoValue}>{contaSelecionada.observacoes}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              {contaSelecionada.status === StatusConta.FECHADA && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalDetalhesVisivel(false);
                    handleMarcarComoPaga(contaSelecionada);
                  }}
                >
                  <Icon name="check-circle" size={20} color="#FFF" />
                  <Text style={styles.modalButtonText}>Marcar como Paga</Text>
                </TouchableOpacity>
              )}
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
        <Text style={styles.headerTitle}>Contas das Mesas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filtrosContainer}>
        <TouchableOpacity
          style={[styles.filtroButton, filtroStatus === 'todos' && styles.filtroButtonActive]}
          onPress={() => setFiltroStatus('todos')}
        >
          <Text style={[styles.filtroButtonText, filtroStatus === 'todos' && styles.filtroButtonTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroButton, filtroStatus === 'abertas' && styles.filtroButtonActive]}
          onPress={() => setFiltroStatus('abertas')}
        >
          <Text style={[styles.filtroButtonText, filtroStatus === 'abertas' && styles.filtroButtonTextActive]}>
            Abertas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroButton, filtroStatus === 'fechadas' && styles.filtroButtonActive]}
          onPress={() => setFiltroStatus('fechadas')}
        >
          <Text style={[styles.filtroButtonText, filtroStatus === 'fechadas' && styles.filtroButtonTextActive]}>
            Fechadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroButton, filtroStatus === 'pagas' && styles.filtroButtonActive]}
          onPress={() => setFiltroStatus('pagas')}
        >
          <Text style={[styles.filtroButtonText, filtroStatus === 'pagas' && styles.filtroButtonTextActive]}>
            Pagas
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={contas}
          renderItem={renderConta}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="receipt-long" size={80} color="#DDD" />
              <Text style={styles.emptyText}>Nenhuma conta encontrada</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={() => {
                setAtualizando(true);
                carregarContas();
              }}
            />
          }
        />
      )}

      {renderModalDetalhes()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  filtrosContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  filtroButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filtroButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filtroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filtroButtonTextActive: {
    color: '#FFF',
  },
  lista: {
    padding: 16,
  },
  contaCard: {
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
  contaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contaMesaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contaData: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contaInfo: {
    marginBottom: 12,
  },
  contaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contaInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  contaInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  marcarPagaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  marcarPagaButtonText: {
    color: '#4CAF50',
    fontSize: 14,
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
    paddingBottom: 16,
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
    padding: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

