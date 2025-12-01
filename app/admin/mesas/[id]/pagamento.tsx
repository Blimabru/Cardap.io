/**
 * Tela de Pagamento (Simulado)
 * 
 * Processa pagamento da conta da mesa
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { Mesa, ContaMesa, FormaPagamento } from '../../../../types';
import * as mesasService from '../../../../services/mesas.service';
import * as contasService from '../../../../services/contas.service';

export default function PagamentoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { podeGerenciar } = useAuth();
  const mesaId = params.id as string;
  const contaId = params.conta_id as string;

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [conta, setConta] = useState<ContaMesa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState<FormaPagamento | null>(null);

  useEffect(() => {
    if (podeGerenciar && mesaId && contaId) {
      carregarDados();
    }
  }, [mesaId, contaId, podeGerenciar]);

  const carregarDados = async () => {
    try {
      const [mesaData, contaData] = await Promise.all([
        mesasService.buscarMesaPorId(mesaId),
        contasService.buscarContaPorId(contaId),
      ]);
      setMesa(mesaData);
      setConta(contaData);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar os dados');
      router.back();
    } finally {
      setCarregando(false);
    }
  };

  const formasPagamento: { value: FormaPagamento; label: string; icon: string }[] = [
    { value: FormaPagamento.DINHEIRO, label: 'Dinheiro', icon: 'money' },
    { value: FormaPagamento.CARTAO_DEBITO, label: 'Cartão de Débito', icon: 'credit-card' },
    { value: FormaPagamento.CARTAO_CREDITO, label: 'Cartão de Crédito', icon: 'credit-card' },
    { value: FormaPagamento.PIX, label: 'PIX', icon: 'qr-code' },
  ];

  const handleConfirmarPagamento = async () => {
    if (!formaPagamentoSelecionada) {
      Alert.alert('Atenção', 'Selecione uma forma de pagamento');
      return;
    }

    if (!conta) {
      Alert.alert('Erro', 'Conta não encontrada');
      return;
    }

    Alert.alert(
      'Confirmar Pagamento',
      `Forma de Pagamento: ${formasPagamento.find(f => f.value === formaPagamentoSelecionada)?.label}\n\nValor: R$ ${conta.total.toFixed(2)}\n\nDeseja confirmar o pagamento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setProcessando(true);
              await contasService.finalizarPagamento({
                conta_id: conta.id,
                forma_pagamento: formaPagamentoSelecionada,
              });

              Alert.alert(
                'Pagamento Confirmado!',
                `Pagamento de R$ ${conta.total.toFixed(2)} realizado com sucesso.\n\nA mesa foi liberada.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/admin/mesas');
                    },
                  },
                ]
              );
            } catch (erro: any) {
              Alert.alert('Erro', erro.message || 'Não foi possível processar o pagamento');
            } finally {
              setProcessando(false);
            }
          },
        },
      ]
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

  if (!mesa || !conta) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={80} color="#DDD" />
        <Text style={styles.errorText}>Dados não encontrados</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento - Mesa #{mesa.numero}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo do Pagamento</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Mesa:</Text>
          <Text style={styles.summaryValue}>#{mesa.numero}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryTotal}>R$ {conta.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Selecione a Forma de Pagamento</Text>

        {formasPagamento.map((forma) => (
          <TouchableOpacity
            key={forma.value}
            style={[
              styles.paymentOption,
              formaPagamentoSelecionada === forma.value && styles.paymentOptionSelected,
            ]}
            onPress={() => setFormaPagamentoSelecionada(forma.value)}
          >
            <View style={styles.paymentOptionContent}>
              <Icon
                name={forma.icon as any}
                size={24}
                color={formaPagamentoSelecionada === forma.value ? '#4CAF50' : '#666'}
              />
              <Text
                style={[
                  styles.paymentOptionText,
                  formaPagamentoSelecionada === forma.value && styles.paymentOptionTextSelected,
                ]}
              >
                {forma.label}
              </Text>
            </View>
            {formaPagamentoSelecionada === forma.value && (
              <Icon name="check-circle" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.warningCard}>
        <Icon name="info" size={20} color="#FF9800" />
        <Text style={styles.warningText}>
          Este é um pagamento simulado. Em produção, esta ação integraria com um gateway de pagamento real.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.buttonPrimary,
          (!formaPagamentoSelecionada || processando) && styles.buttonDisabled,
        ]}
        onPress={handleConfirmarPagamento}
        disabled={!formaPagamentoSelecionada || processando}
      >
        {processando ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Icon name="check-circle" size={20} color="#FFF" />
            <Text style={styles.buttonPrimaryText}>Confirmar Pagamento</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 32,
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
  summaryCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  paymentOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  paymentOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    margin: 16,
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

