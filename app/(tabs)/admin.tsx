/**
 * Tela Administrativa
 * 
 * Dashboard para Admin e Dono gerenciarem o sistema
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { obterEstatisticas } from '../../services/pedidos.service';
import { EstatisticasPedidos } from '../../types';

export default function AdminScreen() {
  const router = useRouter();
  const { usuario, podeGerenciar, logout } = useAuth();

  const [estatisticas, setEstatisticas] = useState<EstatisticasPedidos | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (podeGerenciar) {
      carregarEstatisticas();
    }
  }, [podeGerenciar]);

  const carregarEstatisticas = async () => {
    try {
      const dados = await obterEstatisticas();
      setEstatisticas(dados);
    } catch (erro) {
      console.error('Erro ao carregar estatísticas:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Botão de logout clicado!');
    
    // Confirmação compatível com web e mobile
    const confirmar = Platform.OS === 'web'
      ? window.confirm('Deseja realmente sair do sistema?')
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Sair',
            'Deseja realmente sair do sistema?',
            [
              { 
                text: 'Cancelar', 
                style: 'cancel',
                onPress: () => {
                  console.log('❌ Logout cancelado');
                  resolve(false);
                }
              },
              {
                text: 'Sair',
                style: 'destructive',
                onPress: () => {
                  console.log('✅ Confirmação de logout aceita');
                  resolve(true);
                },
              },
            ]
          );
        });

    if (!confirmar) {
      console.log('❌ Usuário cancelou o logout');
      return;
    }

    console.log('🔄 Executando logout...');
    try {
      await logout();
      console.log('✅ Logout realizado! Token removido.');
      console.log('🔄 Redirecionando para login...');
      router.replace('/login');
    } catch (erro) {
      console.error('❌ Erro ao fazer logout:', erro);
    }
  };

  if (!podeGerenciar) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="block" size={80} color="#DDD" />
        <Text style={styles.errorText}>Acesso Restrito</Text>
        <Text style={styles.errorSubtext}>Apenas Admin e Dono podem acessar esta área</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {usuario?.nome_completo}</Text>
          <Text style={styles.role}>{usuario?.perfil.nome_perfil}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            console.log('🖱️ TouchableOpacity do logout pressionado!');
            handleLogout();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="exit-to-app" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 32 }} />
      ) : estatisticas && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="receipt-long" size={32} color="#2196F3" />
            <Text style={styles.statValue}>{estatisticas.total_pedidos}</Text>
            <Text style={styles.statLabel}>Total de Pedidos</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="schedule" size={32} color="#FF9800" />
            <Text style={styles.statValue}>{estatisticas.pendentes}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="restaurant" size={32} color="#9C27B0" />
            <Text style={styles.statValue}>{estatisticas.em_preparo}</Text>
            <Text style={styles.statLabel}>Em Preparo</Text>
          </View>

          <View style={styles.statCard}>
            <Icon name="check-circle" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{estatisticas.finalizados}</Text>
            <Text style={styles.statLabel}>Finalizados</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWide]}>
            <Icon name="attach-money" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>R$ {estatisticas.valor_total.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Faturamento Total</Text>
          </View>
        </View>
      )}

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Gerenciamento</Text>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/admin/produtos')}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="fastfood" size={24} color="#333" />
            <Text style={styles.menuItemText}>Gerenciar Produtos</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/admin/categorias')}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="category" size={24} color="#333" />
            <Text style={styles.menuItemText}>Gerenciar Categorias</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/admin/todos-pedidos')}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="list-alt" size={24} color="#333" />
            <Text style={styles.menuItemText}>Ver Todos os Pedidos</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {usuario?.perfil.nome_perfil === 'Administrador' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/admin/usuarios')}
          >
            <View style={styles.menuItemLeft}>
              <Icon name="people" size={24} color="#333" />
              <Text style={styles.menuItemText}>Gerenciar Usuários</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 Esta é uma versão simplificada do painel administrativo.
        </Text>
        <Text style={styles.infoText}>
          As funcionalidades completas de gerenciamento estão disponíveis via API.
        </Text>
      </View>
    </ScrollView>
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
    padding: 20,
    backgroundColor: '#FFF',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statCardWide: {
    width: '98%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 8,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
});

