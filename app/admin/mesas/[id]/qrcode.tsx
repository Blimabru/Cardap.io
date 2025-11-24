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
  const { podeGerenciar } = useAuth();
  const mesaId = params.id as string;

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
        <Text style={styles.loadingText}>Carregando QR code...</Text>
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Code - Mesa #{mesa.numero}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Mesa #{mesa.numero}</Text>
          <Text style={styles.qrSubtitle}>Escaneie para acessar o cardápio</Text>
          
          <View style={styles.qrCodeWrapper}>
            <QRCode
              value={qrURL}
              size={250}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>

          <Text style={styles.qrCodeText}>{mesa.qr_code}</Text>
          <Text style={styles.qrURLText}>{qrURL}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCompartilhar}
        >
          <Icon name="share" size={24} color="#2196F3" />
          <Text style={styles.actionButtonText}>Compartilhar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={handleRegenerarQR}
        >
          <Icon name="refresh" size={24} color="#F44336" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
            Regenerar QR Code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Informações da Mesa</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Número:</Text>
          <Text style={styles.infoValue}>{mesa.numero}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Capacidade:</Text>
          <Text style={styles.infoValue}>{mesa.capacidade} pessoas</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={styles.infoValue}>{mesa.status}</Text>
        </View>
      </View>
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
  qrContainer: {
    padding: 24,
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    width: '100%',
    maxWidth: 400,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 16,
    fontFamily: 'monospace',
  },
  qrURLText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  actions: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  actionButtonDanger: {
    borderColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  actionButtonTextDanger: {
    color: '#F44336',
  },
  infoContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
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

