/**
 * Tela de Pagamento da Conta
 * 
 * Permite ao cliente pagar a conta da mesa
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import * as contasService from '../../../services/contas.service';
import * as mesasService from '../../../services/mesas.service';
import * as pedidosService from '../../../services/pedidos.service';
import * as rendimentosService from '../../../services/rendimentos.service';
import { ContaMesa, FormaPagamento, Pedido } from '../../../types';

// Função para criar estilos dinâmicos baseados no tamanho da tela
const createDynamicStyles = (screenWidth: number, isSmallScreen: boolean, horizontalPadding: number) => {
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
      padding: isSmallScreen ? 24 : 32,
    },
    loadingText: {
      marginTop: 16,
      fontSize: isSmallScreen ? 14 : 16,
      color: '#666',
    },
    emptyText: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
      color: '#999',
      marginTop: 16,
      textAlign: 'center',
    },
    backButton: {
      marginTop: 24,
      backgroundColor: '#333',
      paddingHorizontal: isSmallScreen ? 20 : 24,
      paddingVertical: isSmallScreen ? 10 : 12,
      borderRadius: 8,
    },
    backButtonText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: horizontalPadding,
      backgroundColor: '#FFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
      fontSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
      textAlign: 'center',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: horizontalPadding,
      paddingBottom: 100,
    },
    resumoCard: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: isSmallScreen ? 16 : 20,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    resumoTitle: {
      fontSize: isSmallScreen ? 18 : 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 8,
    },
    resumoText: {
      fontSize: isSmallScreen ? 13 : 14,
      color: '#666',
      marginBottom: 8,
    },
    resumoTotal: {
      fontSize: isSmallScreen ? 28 : isMediumScreen ? 32 : 36,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    pedidosCard: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: isSmallScreen ? 12 : 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    pedidosTitle: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 12,
    },
    pedidoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: isSmallScreen ? 6 : 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    pedidoNumero: {
      fontSize: isSmallScreen ? 13 : 14,
      color: '#666',
      flex: 1,
    },
    pedidoMesa: {
      fontSize: isSmallScreen ? 11 : 12,
      color: '#666',
      marginTop: 2,
      fontWeight: '600',
    },
    pedidoTotal: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
      color: '#333',
    },
    formaPagamentoCard: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      padding: isSmallScreen ? 12 : 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    formaPagamentoTitle: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 16,
    },
    formaPagamentoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: isSmallScreen ? 12 : 16,
      borderRadius: 8,
      marginBottom: isSmallScreen ? 10 : 12,
      backgroundColor: '#F5F5F5',
      borderWidth: 2,
      borderColor: '#E0E0E0',
    },
    formaPagamentoButtonSelected: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    formaPagamentoButtonText: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
      color: '#333',
      marginLeft: isSmallScreen ? 10 : 12,
      flex: 1,
    },
    formaPagamentoButtonTextSelected: {
      color: '#FFF',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: horizontalPadding,
    },
    modalContent: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      width: '100%',
      maxWidth: screenWidth > 768 ? 500 : screenWidth - (horizontalPadding * 2),
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isSmallScreen ? 16 : 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
      fontSize: isSmallScreen ? 18 : 20,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
    },
    modalBody: {
      padding: isSmallScreen ? 16 : 20,
      maxHeight: screenWidth < 400 ? 350 : 400,
    },
    input: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      padding: isSmallScreen ? 10 : 12,
      fontSize: isSmallScreen ? 14 : 16,
      marginBottom: isSmallScreen ? 12 : 16,
      backgroundColor: '#FFF',
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputHalf: {
      width: '48%',
    },
    pixIcon: {
      alignSelf: 'center',
      marginBottom: isSmallScreen ? 12 : 16,
    },
    pixText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: isSmallScreen ? 12 : 16,
      paddingHorizontal: horizontalPadding,
    },
    pixValue: {
      fontSize: isSmallScreen ? 28 : isMediumScreen ? 32 : 36,
      fontWeight: 'bold',
      color: '#4CAF50',
      textAlign: 'center',
      marginBottom: isSmallScreen ? 12 : 16,
    },
    pixCode: {
      fontSize: isSmallScreen ? 10 : 12,
      color: '#999',
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      padding: isSmallScreen ? 10 : 12,
      backgroundColor: '#F5F5F5',
      borderRadius: 8,
      overflow: 'hidden',
    },
    modalFooter: {
      padding: isSmallScreen ? 16 : 20,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
    },
    modalButton: {
      backgroundColor: '#4CAF50',
      padding: isSmallScreen ? 14 : 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonDisabled: {
      backgroundColor: '#CCC',
    },
    modalButtonText: {
      color: '#FFF',
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '600',
    },
  });
};

export default function PagamentoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrCode = params.qrCode as string;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 768;
  const horizontalPadding = isSmallScreen ? 12 : isMediumScreen ? 16 : 20;

  const [conta, setConta] = useState<ContaMesa | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null);
  const [modalDadosCartao, setModalDadosCartao] = useState(false);
  const [modalDadosPix, setModalDadosPix] = useState(false);
  
  // Dados do cartão (simulação)
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [cvv, setCvv] = useState('');
  const [validade, setValidade] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Buscar mesa pelo QR code
      const mesa = await mesasService.buscarMesaPorQR(qrCode);
      
      // Buscar pedidos pendentes da mesa
      const pedidosData = await pedidosService.listarPedidosPendentesPorMesa(mesa.id);
      setPedidos(pedidosData);
      
      // Calcular total
      const total = pedidosData.reduce((acc, pedido) => acc + pedido.total, 0);
      
      // Criar objeto de conta temporário
      setConta({
        id: '', // Será criado ao fechar conta
        id_mesa: mesa.id,
        status: 'aberta' as any,
        total,
        data_abertura: new Date().toISOString(),
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString(),
        mesa,
      });
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar os dados');
      router.back();
    } finally {
      setCarregando(false);
    }
  };

  const handleSelecionarFormaPagamento = (forma: FormaPagamento) => {
    setFormaPagamento(forma);
    
    if (forma === FormaPagamento.DINHEIRO) {
      Alert.alert(
        'Chamar Garçom',
        'Um garçom será chamado para processar o pagamento em dinheiro.',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => setFormaPagamento(null) },
          { text: 'OK', onPress: () => {
            // Não processa pagamento, apenas informa
            Alert.alert('Garçom Chamado', 'Aguarde o atendimento do garçom.');
          }},
        ]
      );
    } else if (forma === FormaPagamento.CARTAO_CREDITO || forma === FormaPagamento.CARTAO_DEBITO) {
      setModalDadosCartao(true);
    } else if (forma === FormaPagamento.PIX) {
      setModalDadosPix(true);
    }
  };

  const handleProcessarPagamentoCartao = async () => {
    if (!numeroCartao || !nomeCartao || !cvv || !validade) {
      Alert.alert('Atenção', 'Preencha todos os dados do cartão');
      return;
    }

    // Validação básica
    if (numeroCartao.replace(/\s/g, '').length < 16) {
      Alert.alert('Atenção', 'Número do cartão inválido');
      return;
    }

    if (cvv.length < 3) {
      Alert.alert('Atenção', 'CVV inválido');
      return;
    }

    await processarPagamento(formaPagamento!);
  };

  const handleProcessarPagamentoPix = async () => {
    await processarPagamento(FormaPagamento.PIX);
  };

  const processarPagamento = async (forma: FormaPagamento) => {
    if (!conta || pedidos.length === 0) {
      Alert.alert('Erro', 'Não há pedidos para pagar');
      return;
    }

    try {
      setProcessando(true);

      // 1. Fechar conta (se ainda não estiver fechada)
      let contaFechada = conta;
      if (conta.status === 'aberta') {
        contaFechada = await contasService.fecharContaMesa({ id_mesa: conta.id_mesa });
      }

      // 2. Finalizar pagamento
      const contaPaga = await contasService.finalizarPagamento({
        conta_id: contaFechada.id,
        forma_pagamento: forma,
      });

      // 3. Registrar rendimento (apenas se o valor for maior que zero)
      const valorTotal = typeof contaPaga.total === 'string' 
        ? parseFloat(contaPaga.total) 
        : Number(contaPaga.total);
      
      if (valorTotal > 0) {
        await rendimentosService.registrarRendimento({
          id_conta_mesa: contaPaga.id,
          valor: valorTotal,
          forma_pagamento: forma,
        });
      }

      // Nota: A função finalizarPagamento já atualiza o status da mesa para 'livre'
      // via RPC, então não precisamos fazer isso manualmente

      // 5. Mostrar toast de sucesso
      Alert.alert(
        'Conta Paga!',
        `Pagamento de R$ ${contaPaga.total.toFixed(2)} realizado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpar dados do cartão
              setNumeroCartao('');
              setNomeCartao('');
              setCvv('');
              setValidade('');
              setFormaPagamento(null);
              setModalDadosCartao(false);
              setModalDadosPix(false);
              
              // Voltar para o cardápio
              router.replace(`/mesa/${qrCode}`);
            },
          },
        ]
      );
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível processar o pagamento');
    } finally {
      setProcessando(false);
    }
  };

  // Criar estilos dinâmicos baseados no tamanho da tela
  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, horizontalPadding);

  if (carregando) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={dynamicStyles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!conta || pedidos.length === 0) {
    return (
      <View style={dynamicStyles.centerContainer}>
        <Icon name="receipt-long" size={isSmallScreen ? 60 : 80} color="#DDD" />
        <Text style={dynamicStyles.emptyText}>Não há pedidos para pagar</Text>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={dynamicStyles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = pedidos.reduce((acc, pedido) => acc + pedido.total, 0);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={isSmallScreen ? 22 : 24} color="#333" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Pagamento - Mesa #{conta.mesa?.numero}</Text>
        <View style={{ width: isSmallScreen ? 22 : 24 }} />
      </View>

      <ScrollView style={dynamicStyles.content} contentContainerStyle={dynamicStyles.contentContainer}>
        <View style={dynamicStyles.resumoCard}>
          <Text style={dynamicStyles.resumoTitle}>Resumo da Conta</Text>
          <Text style={dynamicStyles.resumoText}>{pedidos.length} pedido(s)</Text>
          <Text style={dynamicStyles.resumoTotal}>Total: R$ {total.toFixed(2)}</Text>
        </View>

        <View style={dynamicStyles.pedidosCard}>
          <Text style={dynamicStyles.pedidosTitle}>Pedidos</Text>
          {pedidos.map((pedido) => (
            <View key={pedido.id} style={dynamicStyles.pedidoItem}>
              <View>
                <Text style={dynamicStyles.pedidoNumero}>Pedido #{pedido.numero_pedido}</Text>
                {pedido.mesa && (
                  <Text style={dynamicStyles.pedidoMesa}>Mesa #{pedido.mesa.numero}</Text>
                )}
              </View>
              <Text style={dynamicStyles.pedidoTotal}>R$ {pedido.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={dynamicStyles.formaPagamentoCard}>
          <Text style={dynamicStyles.formaPagamentoTitle}>Forma de Pagamento</Text>
          
          <TouchableOpacity
            style={[
              dynamicStyles.formaPagamentoButton,
              formaPagamento === FormaPagamento.CARTAO_CREDITO && dynamicStyles.formaPagamentoButtonSelected,
            ]}
            onPress={() => handleSelecionarFormaPagamento(FormaPagamento.CARTAO_CREDITO)}
          >
            <Icon name="credit-card" size={isSmallScreen ? 20 : 24} color={formaPagamento === FormaPagamento.CARTAO_CREDITO ? '#FFF' : '#333'} />
            <Text style={[
              dynamicStyles.formaPagamentoButtonText,
              formaPagamento === FormaPagamento.CARTAO_CREDITO && dynamicStyles.formaPagamentoButtonTextSelected,
            ]}>
              Cartão de Crédito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.formaPagamentoButton,
              formaPagamento === FormaPagamento.CARTAO_DEBITO && dynamicStyles.formaPagamentoButtonSelected,
            ]}
            onPress={() => handleSelecionarFormaPagamento(FormaPagamento.CARTAO_DEBITO)}
          >
            <Icon name="credit-card" size={isSmallScreen ? 20 : 24} color={formaPagamento === FormaPagamento.CARTAO_DEBITO ? '#FFF' : '#333'} />
            <Text style={[
              dynamicStyles.formaPagamentoButtonText,
              formaPagamento === FormaPagamento.CARTAO_DEBITO && dynamicStyles.formaPagamentoButtonTextSelected,
            ]}>
              Cartão de Débito
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.formaPagamentoButton,
              formaPagamento === FormaPagamento.PIX && dynamicStyles.formaPagamentoButtonSelected,
            ]}
            onPress={() => handleSelecionarFormaPagamento(FormaPagamento.PIX)}
          >
            <Icon name="qr-code" size={isSmallScreen ? 20 : 24} color={formaPagamento === FormaPagamento.PIX ? '#FFF' : '#333'} />
            <Text style={[
              dynamicStyles.formaPagamentoButtonText,
              formaPagamento === FormaPagamento.PIX && dynamicStyles.formaPagamentoButtonTextSelected,
            ]}>
              PIX
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.formaPagamentoButton,
              formaPagamento === FormaPagamento.DINHEIRO && dynamicStyles.formaPagamentoButtonSelected,
            ]}
            onPress={() => handleSelecionarFormaPagamento(FormaPagamento.DINHEIRO)}
          >
            <Icon name="money" size={isSmallScreen ? 20 : 24} color={formaPagamento === FormaPagamento.DINHEIRO ? '#FFF' : '#333'} />
            <Text style={[
              dynamicStyles.formaPagamentoButtonText,
              formaPagamento === FormaPagamento.DINHEIRO && dynamicStyles.formaPagamentoButtonTextSelected,
            ]}>
              Dinheiro (Chamar Garçom)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Dados do Cartão */}
      <Modal
        visible={modalDadosCartao}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalDadosCartao(false);
          setFormaPagamento(null);
        }}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Dados do Cartão</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalDadosCartao(false);
                  setFormaPagamento(null);
                }}
              >
                <Icon name="close" size={isSmallScreen ? 22 : 24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={dynamicStyles.modalBody}>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Número do Cartão"
                value={numeroCartao}
                onChangeText={setNumeroCartao}
                keyboardType="numeric"
                maxLength={19}
              />
              <TextInput
                style={dynamicStyles.input}
                placeholder="Nome no Cartão"
                value={nomeCartao}
                onChangeText={setNomeCartao}
              />
              <View style={dynamicStyles.inputRow}>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.inputHalf]}
                  placeholder="Validade (MM/AA)"
                  value={validade}
                  onChangeText={setValidade}
                  maxLength={5}
                />
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.inputHalf]}
                  placeholder="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </ScrollView>

            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, processando && dynamicStyles.modalButtonDisabled]}
                onPress={handleProcessarPagamentoCartao}
                disabled={processando}
              >
                {processando ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={dynamicStyles.modalButtonText}>Pagar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal PIX */}
      <Modal
        visible={modalDadosPix}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalDadosPix(false);
          setFormaPagamento(null);
        }}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Pagamento PIX</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalDadosPix(false);
                  setFormaPagamento(null);
                }}
              >
                <Icon name="close" size={isSmallScreen ? 22 : 24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.modalBody}>
              <Icon name="qr-code" size={isSmallScreen ? 100 : 120} color="#4CAF50" style={dynamicStyles.pixIcon} />
              <Text style={dynamicStyles.pixText}>
                Escaneie o QR Code ou copie o código PIX para pagar
              </Text>
              <Text style={dynamicStyles.pixValue}>R$ {total.toFixed(2)}</Text>
              <Text style={dynamicStyles.pixCode}>
                00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865405{total.toFixed(2)}5802BR5925RESTAURANTE EXEMPLO6009SAO PAULO62070503***6304
              </Text>
            </View>

            <View style={dynamicStyles.modalFooter}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, processando && dynamicStyles.modalButtonDisabled]}
                onPress={handleProcessarPagamentoPix}
                disabled={processando}
              >
                {processando ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={dynamicStyles.modalButtonText}>Confirmar Pagamento</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


