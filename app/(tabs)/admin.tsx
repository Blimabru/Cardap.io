/**
 * Tela Administrativa
 * 
 * Dashboard para Admin e Dono gerenciarem o sistema
 */

import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { obterEstatisticas } from '../../services/pedidos.service';
import * as rendimentosService from '../../services/rendimentos.service';
import { EstatisticasPedidos } from '../../types';
import HomeHeader from '../../components/HomeHeader';

export default function AdminScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { usuario, podeGerenciar, logout } = useAuth();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

  const [estatisticas, setEstatisticas] = useState<EstatisticasPedidos | null>(null);
  const [rendimentosDia, setRendimentosDia] = useState<number>(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (podeGerenciar) {
      carregarEstatisticas();
    }
  }, [podeGerenciar]);

  const carregarEstatisticas = async () => {
    try {
      const [dados, rendimentos] = await Promise.all([
        obterEstatisticas(),
        rendimentosService.obterRendimentosDoDia(),
      ]);
      setEstatisticas(dados);
      setRendimentosDia(rendimentos);
    } catch (erro) {
      console.error('Erro ao carregar estatísticas:', erro);
    } finally {
      setCarregando(false);
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
      ? 20
      : Math.min(20, screenWidth * 0.049);

    // Tamanhos de fonte responsivos
    const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const labelFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);
    const smallFontSize = isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);

    // Tamanhos de ícones responsivos
    const statIconSize = isSmallScreen ? 28 : isMediumScreen ? 30 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078);
    const menuIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const chevronIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const logoutIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const errorIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

    // Largura dos cards de estatísticas
    const statCardWidth = isSmallScreen ? '100%' : '48%';
    const statCardMargin = isSmallScreen ? 0 : '1%';

    return StyleSheet.create({
      scrollContent: {
        flex: 1,
        width: '100%',
        maxWidth: '100%',
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: horizontalPadding,
        backgroundColor: '#FFF',
        width: '100%',
        maxWidth: '100%',
      },
      greeting: {
        fontSize: isSmallScreen ? 18 : isMediumScreen ? 19 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
        fontWeight: 'bold',
        color: '#333',
      },
      role: {
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        color: '#666',
        marginTop: isSmallScreen ? 2 : isMediumScreen ? 2 : isLargeScreen ? 2 : Math.min(2, screenWidth * 0.005),
      },
      logoutButton: {
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
      },
      statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        width: '100%',
        maxWidth: '100%',
      },
      statCard: {
        width: statCardWidth as any,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        margin: statCardMargin as any,
        marginBottom: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      statCardWide: {
        width: '100%',
      },
      statValue: {
        fontSize: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        fontWeight: 'bold',
        color: '#333',
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      statLabel: {
        fontSize: labelFontSize,
        color: '#666',
        marginTop: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
        textAlign: 'center',
      },
      menuContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderRadius: 12,
        padding: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        width: 'auto',
        maxWidth: '100%',
      },
      menuTitle: {
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        fontWeight: 'bold',
        color: '#333',
        padding: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        width: '100%',
        maxWidth: '100%',
      },
      menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
      },
      menuItemText: {
        fontSize: bodyFontSize,
        color: '#333',
        marginLeft: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        flex: 1,
      },
      infoContainer: {
        margin: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        width: 'auto',
        maxWidth: '100%',
      },
      infoText: {
        fontSize: smallFontSize,
        color: '#1976D2',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        backgroundColor: '#F5F5F5',
      },
      errorText: {
        fontSize: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        fontWeight: 'bold',
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        textAlign: 'center',
      },
      errorSubtext: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        color: '#CCC',
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        textAlign: 'center',
      },
      loginButton: {
        marginTop: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        backgroundColor: '#333',
        borderRadius: 8,
        paddingHorizontal: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
      },
      loginButtonText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
      },
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen);

  // Tamanhos de ícones dinâmicos
  const statIconSize = isSmallScreen ? 28 : isMediumScreen ? 30 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078);
  const menuIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const chevronIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const logoutIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const errorIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

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

  const { autenticado } = useAuth();

  if (!autenticado) {
    return (
      <View style={styles.container}>
        <HomeHeader />
        <View style={dynamicStyles.errorContainer}>
          <Icon name="lock" size={errorIconSize} color="#DDD" />
          <Text style={dynamicStyles.errorText}>Login Necessário</Text>
          <Text style={dynamicStyles.errorSubtext}>Faça login para acessar a área administrativa</Text>
          <TouchableOpacity
            style={dynamicStyles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={dynamicStyles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!podeGerenciar) {
    return (
      <View style={styles.container}>
        <HomeHeader />
        <View style={dynamicStyles.errorContainer}>
          <Icon name="block" size={errorIconSize} color="#DDD" />
          <Text style={dynamicStyles.errorText}>Acesso Restrito</Text>
          <Text style={dynamicStyles.errorSubtext}>Apenas Admin e Dono podem acessar esta área</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader />
      <ScrollView style={dynamicStyles.scrollContent}>
        <View style={dynamicStyles.header}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={dynamicStyles.greeting}>Olá, {usuario?.nome_completo}</Text>
            <Text style={dynamicStyles.role}>{usuario?.perfil.nome_perfil}</Text>
          </View>
          
          <TouchableOpacity 
            style={dynamicStyles.logoutButton} 
            onPress={() => {
              console.log('🖱️ TouchableOpacity do logout pressionado!');
              handleLogout();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="exit-to-app" size={logoutIconSize} color="#F44336" />
          </TouchableOpacity>
        </View>

        {carregando ? (
          <ActivityIndicator size="large" color="#333" style={{ marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078) }} />
        ) : estatisticas && (
          <View style={dynamicStyles.statsContainer}>
            <View style={dynamicStyles.statCard}>
              <Icon name="receipt-long" size={statIconSize} color="#2196F3" />
              <Text style={dynamicStyles.statValue}>{estatisticas.total_pedidos}</Text>
              <Text style={dynamicStyles.statLabel}>Total de Pedidos</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <Icon name="schedule" size={statIconSize} color="#FF9800" />
              <Text style={dynamicStyles.statValue}>{estatisticas.pendentes}</Text>
              <Text style={dynamicStyles.statLabel}>Pendentes</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <Icon name="restaurant" size={statIconSize} color="#9C27B0" />
              <Text style={dynamicStyles.statValue}>{estatisticas.em_preparo}</Text>
              <Text style={dynamicStyles.statLabel}>Em Preparo</Text>
            </View>

            <View style={dynamicStyles.statCard}>
              <Icon name="check-circle" size={statIconSize} color="#4CAF50" />
              <Text style={dynamicStyles.statValue}>{estatisticas.finalizados}</Text>
              <Text style={dynamicStyles.statLabel}>Finalizados</Text>
            </View>

            <View style={[dynamicStyles.statCard, dynamicStyles.statCardWide]}>
              <Icon name="attach-money" size={statIconSize} color="#4CAF50" />
              <Text style={dynamicStyles.statValue}>R$ {estatisticas.valor_total.toFixed(2)}</Text>
              <Text style={dynamicStyles.statLabel}>Faturamento Total</Text>
            </View>

            <View style={[dynamicStyles.statCard, dynamicStyles.statCardWide]}>
              <Icon name="trending-up" size={statIconSize} color="#4CAF50" />
              <Text style={dynamicStyles.statValue}>R$ {rendimentosDia.toFixed(2)}</Text>
              <Text style={dynamicStyles.statLabel}>Rendimentos do Dia</Text>
            </View>
          </View>
        )}

        <View style={dynamicStyles.menuContainer}>
          <Text style={dynamicStyles.menuTitle}>Gerenciamento</Text>

          <TouchableOpacity 
            style={dynamicStyles.menuItem}
            onPress={() => router.push('/admin/produtos')}
          >
            <View style={dynamicStyles.menuItemLeft}>
              <Icon name="fastfood" size={menuIconSize} color="#333" />
              <Text style={dynamicStyles.menuItemText}>Gerenciar Produtos</Text>
            </View>
            <Icon name="chevron-right" size={chevronIconSize} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.menuItem}
            onPress={() => router.push('/admin/categorias')}
          >
            <View style={dynamicStyles.menuItemLeft}>
              <Icon name="category" size={menuIconSize} color="#333" />
              <Text style={dynamicStyles.menuItemText}>Gerenciar Categorias</Text>
            </View>
            <Icon name="chevron-right" size={chevronIconSize} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.menuItem}
            onPress={() => router.push('/admin/todos-pedidos')}
          >
            <View style={dynamicStyles.menuItemLeft}>
              <Icon name="list-alt" size={menuIconSize} color="#333" />
              <Text style={dynamicStyles.menuItemText}>Ver Todos os Pedidos</Text>
            </View>
            <Icon name="chevron-right" size={chevronIconSize} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.menuItem}
            onPress={() => router.push('/admin/mesas')}
          >
            <View style={dynamicStyles.menuItemLeft}>
              <Icon name="table-restaurant" size={menuIconSize} color="#333" />
              <Text style={dynamicStyles.menuItemText}>Gerenciar Mesas</Text>
            </View>
            <Icon name="chevron-right" size={chevronIconSize} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.menuItem}
            onPress={() => router.push('/admin/contas-mesas')}
          >
            <View style={dynamicStyles.menuItemLeft}>
              <Icon name="account-balance-wallet" size={menuIconSize} color="#333" />
              <Text style={dynamicStyles.menuItemText}>Contas das Mesas</Text>
            </View>
            <Icon name="chevron-right" size={chevronIconSize} color="#999" />
          </TouchableOpacity>

          {usuario?.perfil.nome_perfil === 'Administrador' && (
            <TouchableOpacity 
              style={dynamicStyles.menuItem}
              onPress={() => router.push('/admin/usuarios')}
            >
              <View style={dynamicStyles.menuItemLeft}>
                <Icon name="people" size={menuIconSize} color="#333" />
                <Text style={dynamicStyles.menuItemText}>Gerenciar Usuários</Text>
              </View>
              <Icon name="chevron-right" size={chevronIconSize} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={dynamicStyles.infoContainer}>
          <Text style={dynamicStyles.infoText}>
            💡 Esta é uma versão simplificada do painel administrativo.
          </Text>
          <Text style={dynamicStyles.infoText}>
            As funcionalidades completas de gerenciamento estão disponíveis via API.
          </Text>
        </View>
      </ScrollView>
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

