/**
 * Tela de Visualização de QR Code da Mesa
 * 
 * Exibe QR code para impressão/compartilhamento
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../../../contexts/AuthContext';
import { Mesa } from '../../../../types';
import * as mesasService from '../../../../services/mesas.service';
import { gerarURLCompletaQRCode } from '../../../../services/qrcode.service';

export default function QRCodeScreen() {
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
  const [carregando, setCarregando] = useState(true);
  const [qrURL, setQrURL] = useState('');

  useEffect(() => {
    if (podeGerenciar && mesaId) {
      carregarMesa();
    }
  }, [mesaId, podeGerenciar]);

  const carregarMesa = async () => {
    try {
      const dados = await mesasService.buscarMesaPorId(mesaId);
      setMesa(dados);
      // Gerar URL completa do QR code
      const url = gerarURLCompletaQRCode(dados.qr_code);
      setQrURL(url);
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível carregar a mesa');
      router.back();
    } finally {
      setCarregando(false);
    }
  };

  const handleRegenerarQR = async () => {
    if (!mesa) return;

    Alert.alert(
      'Regenerar QR Code',
      'Tem certeza que deseja regenerar o QR code? O código anterior não funcionará mais.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Regenerar',
          style: 'destructive',
          onPress: async () => {
            try {
              const mesaAtualizada = await mesasService.regenerarQRCode(mesa.id);
              setMesa(mesaAtualizada);
              const url = gerarURLCompletaQRCode(mesaAtualizada.qr_code);
              setQrURL(url);
              Alert.alert('Sucesso', 'QR code regenerado com sucesso!');
            } catch (erro: any) {
              Alert.alert('Erro', erro.message || 'Não foi possível regenerar o QR code');
            }
          },
        },
      ]
    );
  };

  const handleCompartilhar = async () => {
    if (!mesa || !qrURL) return;

    try {
      await Share.share({
        message: `QR Code da Mesa #${mesa.numero}\n\nEscaneie para acessar o cardápio:\n${qrURL}`,
        title: `QR Code - Mesa #${mesa.numero}`,
      });
    } catch (erro: any) {
      Alert.alert('Erro', 'Não foi possível compartilhar o QR code');
    }
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
    const smallFontSize = isSmallScreen ? 9 : isMediumScreen ? 10 : isLargeScreen ? 10 : Math.min(10, screenWidth * 0.024);
    const largeFontSize = isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044);
    const qrTitleFontSize = isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);

    // Tamanho do QR code responsivo
    const qrCodeSize = isSmallScreen 
      ? Math.min(200, screenWidth * 0.55)
      : isMediumScreen 
      ? Math.min(220, screenWidth * 0.55)
      : isLargeScreen
      ? Math.min(250, screenWidth * 0.55)
      : Math.min(250, screenWidth * 0.55);

    // Tamanhos de ícones responsivos
    const headerIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const actionIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
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
      qrContainer: {
        padding: horizontalPadding,
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
      },
      qrCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: isSmallScreen ? 20 : isMediumScreen ? 24 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        width: '100%',
        maxWidth: isSmallScreen ? screenWidth * 0.95 : isMediumScreen ? screenWidth * 0.90 : isLargeScreen ? 400 : Math.min(400, screenWidth * 0.975),
      },
      qrTitle: {
        fontSize: qrTitleFontSize,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      qrSubtitle: {
        fontSize: bodyFontSize,
        color: '#666',
        marginBottom: isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        textAlign: 'center',
      },
      qrCodeWrapper: {
        backgroundColor: '#FFF',
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderRadius: 12,
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      qrCodeText: {
        fontSize: smallFontSize,
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontFamily: 'monospace',
        textAlign: 'center',
      },
      qrURLText: {
        fontSize: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        color: '#666',
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        textAlign: 'center',
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      actions: {
        paddingHorizontal: horizontalPadding,
        gap: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        width: '100%',
        maxWidth: '100%',
      },
      actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2196F3',
        gap: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        width: '100%',
      },
      actionButtonDanger: {
        borderColor: '#F44336',
      },
      actionButtonText: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
        color: '#2196F3',
      },
      actionButtonTextDanger: {
        color: '#F44336',
      },
      infoContainer: {
        marginTop: isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        marginHorizontal: horizontalPadding,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: horizontalPadding,
        width: '100%',
        maxWidth: '100%',
      },
      infoTitle: {
        fontSize: largeFontSize,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        width: '100%',
        maxWidth: '100%',
      },
      infoLabel: {
        fontSize: bodyFontSize,
        color: '#666',
      },
      infoValue: {
        fontSize: bodyFontSize,
        fontWeight: '600',
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
  const actionIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);
  
  // Tamanho do QR code dinâmico
  const qrCodeSize = isSmallScreen 
    ? Math.min(200, screenWidth * 0.55)
    : isMediumScreen 
    ? Math.min(220, screenWidth * 0.55)
    : isLargeScreen
    ? Math.min(250, screenWidth * 0.55)
    : Math.min(250, screenWidth * 0.55);

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
          <Text style={dynamicStyles.loadingText}>Carregando QR code...</Text>
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={headerIconSize} color="#333" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle} numberOfLines={2}>QR Code - Mesa #{mesa.numero}</Text>
        <View style={{ width: headerIconSize }} />
      </View>

      <View style={dynamicStyles.qrContainer}>
        <View style={dynamicStyles.qrCard}>
          <Text style={dynamicStyles.qrTitle}>Mesa #{mesa.numero}</Text>
          <Text style={dynamicStyles.qrSubtitle}>Escaneie para acessar o cardápio</Text>
          
          <View style={dynamicStyles.qrCodeWrapper}>
            <QRCode
              value={qrURL}
              size={qrCodeSize}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>

          <Text style={dynamicStyles.qrCodeText}>{mesa.qr_code}</Text>
          <Text style={dynamicStyles.qrURLText} numberOfLines={2}>{qrURL}</Text>
        </View>
      </View>

      <View style={dynamicStyles.actions}>
        <TouchableOpacity
          style={dynamicStyles.actionButton}
          onPress={handleCompartilhar}
        >
          <Icon name="share" size={actionIconSize} color="#2196F3" />
          <Text style={dynamicStyles.actionButtonText}>Compartilhar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dynamicStyles.actionButton, dynamicStyles.actionButtonDanger]}
          onPress={handleRegenerarQR}
        >
          <Icon name="refresh" size={actionIconSize} color="#F44336" />
          <Text style={[dynamicStyles.actionButtonText, dynamicStyles.actionButtonTextDanger]}>
            Regenerar QR Code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.infoContainer}>
        <Text style={dynamicStyles.infoTitle}>Informações da Mesa</Text>
        <View style={dynamicStyles.infoRow}>
          <Text style={dynamicStyles.infoLabel}>Número:</Text>
          <Text style={dynamicStyles.infoValue}>{mesa.numero}</Text>
        </View>
        <View style={dynamicStyles.infoRow}>
          <Text style={dynamicStyles.infoLabel}>Capacidade:</Text>
          <Text style={dynamicStyles.infoValue}>{mesa.capacidade} pessoas</Text>
        </View>
        <View style={dynamicStyles.infoRow}>
          <Text style={dynamicStyles.infoLabel}>Status:</Text>
          <Text style={dynamicStyles.infoValue}>{mesa.status}</Text>
        </View>
      </View>
    </ScrollView>
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
  content: {
    paddingBottom: 32,
    width: '100%',
    maxWidth: '100%',
  },
});

