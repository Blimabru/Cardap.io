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
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ContaMesa, StatusConta, FormaPagamento } from '../../types';
import * as contasService from '../../services/contas.service';

export default function ContasMesasScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { podeGerenciar } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

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
    const modalTitleFontSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);

    // Tamanhos de ícones responsivos
    const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const modalIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

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
      filtrosContainer: {
        flexDirection: 'row',
        padding: horizontalPadding,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
        gap: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      filtroButton: {
        flex: 1,
        paddingVertical: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        paddingHorizontal: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        minWidth: 0,
      },
      filtroButtonActive: {
        backgroundColor: '#4CAF50',
      },
      filtroButtonText: {
        fontSize: isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        fontWeight: '600',
        color: '#666',
      },
      filtroButtonTextActive: {
        color: '#FFF',
      },
      lista: {
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      contaCard: {
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
      contaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      contaMesaNumero: {
        fontSize: largeFontSize,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      contaData: {
        fontSize: smallFontSize,
        color: '#666',
      },
      statusBadge: {
        paddingHorizontal: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        paddingVertical: isSmallScreen ? 5 : isMediumScreen ? 5.5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
        borderRadius: 12,
      },
      statusText: {
        color: '#FFF',
        fontSize: smallFontSize,
        fontWeight: '600',
      },
      contaInfo: {
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      contaInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        width: '100%',
        maxWidth: '100%',
      },
      contaInfoLabel: {
        fontSize: bodyFontSize,
        color: '#666',
      },
      contaInfoValue: {
        fontSize: bodyFontSize,
        fontWeight: '600',
        color: '#333',
      },
      marcarPagaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: isSmallScreen ? 8 : isMediumScreen ? 9 : isLargeScreen ? 10 : Math.min(10, screenWidth * 0.024),
        borderRadius: 8,
        gap: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        width: '100%',
      },
      marcarPagaButtonText: {
        color: '#4CAF50',
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        fontWeight: '600',
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
      modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
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
        fontSize: modalTitleFontSize,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      modalCloseButton: {
        padding: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      modalBody: {
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      modalInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        width: '100%',
        maxWidth: '100%',
      },
      modalInfoLabel: {
        fontSize: bodyFontSize,
        color: '#666',
        flex: 1,
      },
      modalInfoValue: {
        fontSize: bodyFontSize,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'right',
      },
      modalFooter: {
        padding: horizontalPadding,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderRadius: 8,
        gap: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        width: '100%',
      },
      modalButtonText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        fontWeight: 'bold',
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
        style={dynamicStyles.contaCard}
        onPress={() => abrirModalDetalhes(item)}
      >
        <View style={dynamicStyles.contaHeader}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={dynamicStyles.contaMesaNumero}>Mesa #{item.mesa?.numero}</Text>
            <Text style={dynamicStyles.contaData}>
              {dataFechamento ? `Fechada em ${dataFechamento}` : `Aberta em ${dataAbertura}`}
            </Text>
          </View>
          <View style={[dynamicStyles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}>
            <Text style={dynamicStyles.statusText}>{formatarStatus(item.status)}</Text>
          </View>
        </View>

        <View style={dynamicStyles.contaInfo}>
          <View style={dynamicStyles.contaInfoRow}>
            <Text style={dynamicStyles.contaInfoLabel}>Total:</Text>
            <Text style={dynamicStyles.contaInfoValue}>R$ {item.total.toFixed(2)}</Text>
          </View>
          {item.forma_pagamento && (
            <View style={dynamicStyles.contaInfoRow}>
              <Text style={dynamicStyles.contaInfoLabel}>Pagamento:</Text>
              <Text style={dynamicStyles.contaInfoValue}>{formatarFormaPagamento(item.forma_pagamento)}</Text>
            </View>
          )}
        </View>

        {item.status === StatusConta.FECHADA && (
          <TouchableOpacity
            style={dynamicStyles.marcarPagaButton}
            onPress={() => handleMarcarComoPaga(item)}
          >
            <Icon name="check-circle" size={actionIconSize} color="#4CAF50" />
            <Text style={dynamicStyles.marcarPagaButtonText}>Marcar como Paga</Text>
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
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle} numberOfLines={2}>
                Detalhes - Mesa #{contaSelecionada.mesa?.numero}
              </Text>
              <TouchableOpacity
                onPress={() => setModalDetalhesVisivel(false)}
                style={dynamicStyles.modalCloseButton}
              >
                <Icon name="close" size={modalIconSize} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={dynamicStyles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={dynamicStyles.modalInfoRow}>
                <Text style={dynamicStyles.modalInfoLabel}>Status:</Text>
                <View style={[dynamicStyles.statusBadge, { backgroundColor: corDoStatus(contaSelecionada.status) }]}>
                  <Text style={dynamicStyles.statusText}>{formatarStatus(contaSelecionada.status)}</Text>
                </View>
              </View>

              <View style={dynamicStyles.modalInfoRow}>
                <Text style={dynamicStyles.modalInfoLabel}>Total:</Text>
                <Text style={dynamicStyles.modalInfoValue}>R$ {contaSelecionada.total.toFixed(2)}</Text>
              </View>

              {contaSelecionada.forma_pagamento && (
                <View style={dynamicStyles.modalInfoRow}>
                  <Text style={dynamicStyles.modalInfoLabel}>Forma de Pagamento:</Text>
                  <Text style={dynamicStyles.modalInfoValue} numberOfLines={2}>
                    {formatarFormaPagamento(contaSelecionada.forma_pagamento)}
                  </Text>
                </View>
              )}

              <View style={dynamicStyles.modalInfoRow}>
                <Text style={dynamicStyles.modalInfoLabel}>Data de Abertura:</Text>
                <Text style={dynamicStyles.modalInfoValue} numberOfLines={2}>
                  {new Date(contaSelecionada.data_abertura).toLocaleString('pt-BR')}
                </Text>
              </View>

              {contaSelecionada.data_fechamento && (
                <View style={dynamicStyles.modalInfoRow}>
                  <Text style={dynamicStyles.modalInfoLabel}>Data de Fechamento:</Text>
                  <Text style={dynamicStyles.modalInfoValue} numberOfLines={2}>
                    {new Date(contaSelecionada.data_fechamento).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}

              {contaSelecionada.data_pagamento && (
                <View style={dynamicStyles.modalInfoRow}>
                  <Text style={dynamicStyles.modalInfoLabel}>Data de Pagamento:</Text>
                  <Text style={dynamicStyles.modalInfoValue} numberOfLines={2}>
                    {new Date(contaSelecionada.data_pagamento).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}

              {contaSelecionada.observacoes && (
                <View style={dynamicStyles.modalInfoRow}>
                  <Text style={dynamicStyles.modalInfoLabel}>Observações:</Text>
                  <Text style={dynamicStyles.modalInfoValue} numberOfLines={3}>
                    {contaSelecionada.observacoes}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={dynamicStyles.modalFooter}>
              {contaSelecionada.status === StatusConta.FECHADA && (
                <TouchableOpacity
                  style={dynamicStyles.modalButton}
                  onPress={() => {
                    setModalDetalhesVisivel(false);
                    handleMarcarComoPaga(contaSelecionada);
                  }}
                >
                  <Icon name="check-circle" size={actionIconSize} color="#FFF" />
                  <Text style={dynamicStyles.modalButtonText}>Marcar como Paga</Text>
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
        <Text style={dynamicStyles.headerTitle}>Contas das Mesas</Text>
        <View style={{ width: headerIconSize }} />
      </View>

      <View style={dynamicStyles.filtrosContainer}>
        <TouchableOpacity
          style={[dynamicStyles.filtroButton, filtroStatus === 'todos' && dynamicStyles.filtroButtonActive]}
          onPress={() => setFiltroStatus('todos')}
        >
          <Text style={[dynamicStyles.filtroButtonText, filtroStatus === 'todos' && dynamicStyles.filtroButtonTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.filtroButton, filtroStatus === 'abertas' && dynamicStyles.filtroButtonActive]}
          onPress={() => setFiltroStatus('abertas')}
        >
          <Text style={[dynamicStyles.filtroButtonText, filtroStatus === 'abertas' && dynamicStyles.filtroButtonTextActive]}>
            Abertas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.filtroButton, filtroStatus === 'fechadas' && dynamicStyles.filtroButtonActive]}
          onPress={() => setFiltroStatus('fechadas')}
        >
          <Text style={[dynamicStyles.filtroButtonText, filtroStatus === 'fechadas' && dynamicStyles.filtroButtonTextActive]}>
            Fechadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.filtroButton, filtroStatus === 'pagas' && dynamicStyles.filtroButtonActive]}
          onPress={() => setFiltroStatus('pagas')}
        >
          <Text style={[dynamicStyles.filtroButtonText, filtroStatus === 'pagas' && dynamicStyles.filtroButtonTextActive]}>
            Pagas
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078) }} />
      ) : (
        <FlatList
          data={contas}
          renderItem={renderConta}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.lista}
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <Icon name="receipt-long" size={emptyIconSize} color="#DDD" />
              <Text style={dynamicStyles.emptyText}>Nenhuma conta encontrada</Text>
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
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
});

