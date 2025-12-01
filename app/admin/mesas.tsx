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
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Mesa, StatusMesa } from '../../types';
import * as mesasService from '../../services/mesas.service';
import { listarPedidosPendentesPorMesa } from '../../services/pedidos.service';

export default function MesasScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { podeGerenciar } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

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
      mesaCard: {
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
      mesaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      mesaNumero: {
        fontSize: isSmallScreen ? 15 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: 'bold',
        color: '#333',
      },
      mesaInfo: {
        fontSize: isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
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
      mesaActions: {
        flexDirection: 'row',
        marginTop: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        gap: isSmallScreen ? 8 : isMediumScreen ? 10 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        gap: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      actionButtonPrimary: {
        backgroundColor: '#E8F5E9',
      },
      actionText: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
        fontWeight: '600',
      },
      actionTextPrimary: {
        color: '#4CAF50',
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
      label: {
        fontSize: labelFontSize,
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        marginTop: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        fontSize: bodyFontSize,
        backgroundColor: '#FFF',
        width: '100%',
        maxWidth: '100%',
      },
      buttonPrimary: {
        backgroundColor: '#333',
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderRadius: 8,
        alignItems: 'center',
        marginTop: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        width: '100%',
      },
      buttonPrimaryText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
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

  const renderMesa = ({ item }: { item: Mesa }) => {
    return (
      <View style={dynamicStyles.mesaCard}>
        <View style={dynamicStyles.mesaHeader}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={dynamicStyles.mesaNumero}>Mesa #{item.numero}</Text>
            <Text style={dynamicStyles.mesaInfo}>Capacidade: {item.capacidade} pessoas</Text>
          </View>
          
          <TouchableOpacity
            style={[dynamicStyles.statusBadge, { backgroundColor: corDoStatus(item.status) }]}
            onPress={() => abrirModalStatus(item)}
          >
            <Text style={dynamicStyles.statusText}>{formatarStatus(item.status)}</Text>
            <Icon name="expand-more" size={statusIconSize} color="#FFF" style={{ marginLeft: isSmallScreen ? 3 : isMediumScreen ? 3.5 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010) }} />
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.mesaActions}>
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => handleVerQRCode(item)}
          >
            <Icon name="qr-code-2" size={actionIconSize} color="#2196F3" />
            <Text style={dynamicStyles.actionText}>Ver QR Code</Text>
          </TouchableOpacity>

          {item.status === StatusMesa.OCUPADA && (
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.actionButtonPrimary]}
              onPress={() => handleFecharConta(item)}
            >
              <Icon name="receipt" size={actionIconSize} color="#4CAF50" />
              <Text style={[dynamicStyles.actionText, dynamicStyles.actionTextPrimary]}>Fechar Conta</Text>
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
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Nova Mesa</Text>
              <TouchableOpacity onPress={() => setModalCriarVisivel(false)}>
                <Icon name="close" size={modalIconSize} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.label}>Número da Mesa *</Text>
              <TextInput
                style={dynamicStyles.input}
                value={numeroNovaMesa}
                onChangeText={setNumeroNovaMesa}
                placeholder="Ex: 1, 2, 3..."
                keyboardType="number-pad"
              />

              <Text style={dynamicStyles.label}>Capacidade</Text>
              <TextInput
                style={dynamicStyles.input}
                value={capacidadeNovaMesa}
                onChangeText={setCapacidadeNovaMesa}
                placeholder="4"
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={dynamicStyles.buttonPrimary}
                onPress={handleCriarMesa}
              >
                <Text style={dynamicStyles.buttonPrimaryText}>Criar Mesa</Text>
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
                Mesa #{mesaSelecionada.numero}
              </Text>
              
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    dynamicStyles.statusOption,
                    mesaSelecionada.status === status && dynamicStyles.statusOptionAtual,
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
                  {mesaSelecionada.status === status && (
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
        <Text style={dynamicStyles.headerTitle}>Gerenciar Mesas</Text>
        <TouchableOpacity onPress={() => setModalCriarVisivel(true)}>
          <Icon name="add" size={headerIconSize} color="#333" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078) }} />
      ) : (
        <FlatList
          data={mesas}
          renderItem={renderMesa}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.lista}
          ListEmptyComponent={() => (
            <View style={dynamicStyles.emptyContainer}>
              <Icon name="table-restaurant" size={emptyIconSize} color="#DDD" />
              <Text style={dynamicStyles.emptyText}>Nenhuma mesa cadastrada</Text>
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
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
});

