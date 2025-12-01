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
  View,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import * as contasService from '../../../../services/contas.service';
import * as mesasService from '../../../../services/mesas.service';
import { listarPedidosPendentesPorMesa } from '../../../../services/pedidos.service';
import { Mesa, Pedido } from '../../../../types';

export default function FecharContaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width: screenWidth } = useWindowDimensions();
  const { podeGerenciar } = useAuth();
  const mesaId = params.id as string;

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

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
    const totalFontSize = isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078);

    // Tamanhos de ícones responsivos
    const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
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
        flex: 1,
        marginHorizontal: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      lista: {
        padding: horizontalPadding,
        paddingBottom: isSmallScreen ? 120 : isMediumScreen ? 130 : isLargeScreen ? 140 : Math.min(140, screenWidth * 0.341),
        width: '100%',
        maxWidth: '100%',
      },
      infoCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: horizontalPadding,
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        width: '100%',
        maxWidth: '100%',
      },
      infoTitle: {
        fontSize: largeFontSize,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      infoText: {
        fontSize: bodyFontSize,
        color: '#666',
        marginTop: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
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
      pedidoMesa: {
        fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
        marginTop: isSmallScreen ? 2 : isMediumScreen ? 2 : isLargeScreen ? 2 : Math.min(2, screenWidth * 0.005),
        fontWeight: '600',
      },
      pedidoTotal: {
        fontSize: largeFontSize,
        fontWeight: 'bold',
        color: '#4CAF50',
      },
      pedidoItens: {
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      itemText: {
        fontSize: bodyFontSize,
        color: '#666',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      pedidoDetalhes: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      detalheText: {
        fontSize: smallFontSize,
        color: '#999',
        marginTop: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        padding: horizontalPadding,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
        width: '100%',
        maxWidth: '100%',
      },
      totalContainer: {
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        alignItems: 'center',
      },
      totalLabel: {
        fontSize: bodyFontSize,
        color: '#666',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      totalValue: {
        fontSize: totalFontSize,
        fontWeight: 'bold',
        color: '#333',
      },
      buttonPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderRadius: 12,
        gap: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        width: '100%',
      },
      buttonDisabled: {
        opacity: 0.6,
      },
      buttonPrimaryText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        fontWeight: '600',
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
      },
      emptyText: {
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        fontWeight: 'bold',
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        textAlign: 'center',
      },
      emptySubtext: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#999',
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        textAlign: 'center',
        paddingHorizontal: isSmallScreen ? 16 : isMediumScreen ? 20 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
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
      centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
      },
      loadingText: {
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#666',
      },
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen);

  // Tamanhos de ícones dinâmicos
  const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const actionIconSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
  const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

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
      <View style={dynamicStyles.pedidoCard}>
        <View style={dynamicStyles.pedidoHeader}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={dynamicStyles.pedidoNumero}>Pedido #{item.numero_pedido}</Text>
            {item.mesa && (
              <Text style={dynamicStyles.pedidoMesa}>Mesa #{item.mesa.numero}</Text>
            )}
          </View>
          <Text style={dynamicStyles.pedidoTotal}>R$ {item.total.toFixed(2)}</Text>
        </View>

        <View style={dynamicStyles.pedidoItens}>
          {item.itens.map((itemPedido, index) => (
            <Text key={index} style={dynamicStyles.itemText}>
              • {itemPedido.quantidade}x {itemPedido.produto.name} - R$ {itemPedido.subtotal.toFixed(2)}
            </Text>
          ))}
        </View>

        <View style={dynamicStyles.pedidoDetalhes}>
          <Text style={dynamicStyles.detalheText}>
            Subtotal: R$ {item.subtotal.toFixed(2)}
          </Text>
          {item.taxa_servico > 0 && (
            <Text style={dynamicStyles.detalheText}>
              Taxa de Serviço: R$ {item.taxa_servico.toFixed(2)}
            </Text>
          )}
          {item.taxa_entrega > 0 && (
            <Text style={dynamicStyles.detalheText}>
              Taxa de Entrega: R$ {item.taxa_entrega.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
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

  if (carregando) {
    return (
      <View style={styles.container}>
        <View style={dynamicStyles.centerContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={dynamicStyles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  if (!mesa) {
    return (
      <View style={styles.container}>
        <View style={dynamicStyles.errorContainer}>
          <Icon name="error-outline" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.errorText}>Mesa não encontrada</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={dynamicStyles.linkText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const total = calcularTotal();

  return (
    <View style={styles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={headerIconSize} color="#333" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle} numberOfLines={2}>Fechar Conta - Mesa #{mesa.numero}</Text>
        <View style={{ width: headerIconSize }} />
      </View>

      {pedidos.length === 0 ? (
        <View style={dynamicStyles.emptyContainer}>
          <Icon name="receipt-long" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.emptyText}>Não há pedidos pendentes</Text>
          <Text style={dynamicStyles.emptySubtext}>A conta desta mesa já está fechada ou não possui pedidos.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={pedidos}
            renderItem={renderPedido}
            keyExtractor={(item) => item.id}
            contentContainerStyle={dynamicStyles.lista}
            ListHeaderComponent={() => (
              <View style={dynamicStyles.infoCard}>
                <Text style={dynamicStyles.infoTitle}>Resumo da Conta</Text>
                <Text style={dynamicStyles.infoText}>Mesa #{mesa.numero}</Text>
                <Text style={dynamicStyles.infoText}>{pedidos.length} pedido(s) pendente(s)</Text>
              </View>
            )}
          />

          <View style={dynamicStyles.footer}>
            <View style={dynamicStyles.totalContainer}>
              <Text style={dynamicStyles.totalLabel}>Total a Pagar</Text>
              <Text style={dynamicStyles.totalValue}>R$ {total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[dynamicStyles.buttonPrimary, fechando && dynamicStyles.buttonDisabled]}
              onPress={handleFecharConta}
              disabled={fechando}
            >
              {fechando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Icon name="receipt" size={actionIconSize} color="#FFF" />
                  <Text style={dynamicStyles.buttonPrimaryText}>Fechar Conta</Text>
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
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
});

