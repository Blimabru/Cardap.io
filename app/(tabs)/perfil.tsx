/**
 * ============================================================================
 * PERFIL.TSX - TELA DE PERFIL DO USUÁRIO
 * ============================================================================
 * 
 * Tela acessível para TODOS os usuários (Admin, Dono, Cliente).
 * 
 * FUNCIONALIDADES:
 * - Exibir dados do usuário logado
 * - Botão de LOGOUT (principal motivo desta tela!)
 * - Futuramente: editar perfil, trocar senha, etc
 * 
 * IMPORTANTE:
 * Esta tela foi criada para resolver o problema de clientes não poderem
 * deslogar, já que a tab Admin é visível apenas para Admin/Dono.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import HomeHeader from '../../components/HomeHeader';

export default function PerfilScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { usuario, logout, ehAdmin, ehDono, ehCliente } = useAuth();
  const router = useRouter();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;

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
    const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const labelFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);
    const smallFontSize = isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);

    // Tamanhos de avatar e ícones responsivos
    const avatarSize = isSmallScreen ? 100 : isMediumScreen ? 110 : isLargeScreen ? 120 : Math.min(120, screenWidth * 0.292);
    const avatarIconSize = avatarSize * 0.5;
    const infoIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const actionIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const chevronIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
    const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

    return StyleSheet.create({
      scrollContent: {
        flex: 1,
        width: '100%',
        maxWidth: '100%',
      },
      header: {
        backgroundColor: '#FFF',
        alignItems: 'center',
        paddingVertical: isSmallScreen ? 30 : isMediumScreen ? 35 : isLargeScreen ? 40 : Math.min(40, screenWidth * 0.098),
        paddingHorizontal: horizontalPadding,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      avatarContainer: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      nome: {
        fontSize: titleFontSize,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        textAlign: 'center',
      },
      perfilBadge: {
        paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 5 : isMediumScreen ? 5.5 : isLargeScreen ? 6 : Math.min(6, screenWidth * 0.015),
        borderRadius: 16,
      },
      perfilBadgeText: {
        color: '#FFF',
        fontSize: isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034),
        fontWeight: '600',
      },
      section: {
        backgroundColor: '#FFF',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        width: '100%',
        maxWidth: '100%',
      },
      sectionTitle: {
        fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '600',
        color: '#666',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingHorizontal: horizontalPadding,
        textTransform: 'uppercase',
      },
      infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029),
        paddingHorizontal: horizontalPadding,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        width: '100%',
        maxWidth: '100%',
      },
      infoContent: {
        marginLeft: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        flex: 1,
        minWidth: 0,
      },
      infoLabel: {
        fontSize: labelFontSize,
        color: '#999',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      infoValue: {
        fontSize: bodyFontSize,
        color: '#333',
        fontWeight: '500',
      },
      actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        paddingHorizontal: horizontalPadding,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        width: '100%',
        maxWidth: '100%',
      },
      actionButtonText: {
        flex: 1,
        fontSize: bodyFontSize,
        color: '#333',
        marginLeft: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        fontWeight: '500',
      },
      logoutButton: {
        backgroundColor: '#FFF5F5',
        borderBottomWidth: 0,
      },
      logoutButtonText: {
        color: '#F44336',
      },
      footer: {
        alignItems: 'center',
        paddingVertical: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        width: '100%',
        maxWidth: '100%',
      },
      footerText: {
        fontSize: smallFontSize,
        color: '#999',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
      },
      emptyText: {
        fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : isLargeScreen ? 18 : Math.min(18, screenWidth * 0.044),
        color: '#999',
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        marginBottom: isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058),
        textAlign: 'center',
      },
      loginButton: {
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
  const avatarIconSize = isSmallScreen ? 50 : isMediumScreen ? 55 : isLargeScreen ? 60 : Math.min(60, screenWidth * 0.146);
  const infoIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const actionIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const chevronIconSize = isSmallScreen ? 20 : isMediumScreen ? 22 : isLargeScreen ? 24 : Math.min(24, screenWidth * 0.058);
  const emptyIconSize = isSmallScreen ? 60 : isMediumScreen ? 70 : isLargeScreen ? 80 : Math.min(80, screenWidth * 0.195);

  /**
   * Função para fazer logout com confirmação
   * Funciona tanto em web quanto em mobile
   */
  const handleLogout = async () => {
    console.log('🚪 Botão de logout clicado na tela Perfil');
    
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

    try {
      console.log('🔄 Executando logout...');
      await logout();
      console.log('✅ Logout concluído! Redirecionando...');
      // Não precisa redirecionar manualmente, _layout.tsx faz isso
    } catch (erro) {
      console.error('❌ Erro ao fazer logout:', erro);
      
      if (Platform.OS === 'web') {
        alert('Erro ao fazer logout. Tente novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
      }
    }
  };

  // Se não há usuário, mostrar mensagem e botão de login
  if (!usuario) {
    return (
      <View style={styles.container}>
        <HomeHeader />
        <View style={dynamicStyles.emptyContainer}>
          <Icon name="person" size={emptyIconSize} color="#DDD" />
          <Text style={dynamicStyles.emptyText}>Faça login para acessar seu perfil</Text>
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

  // Define cor do badge de perfil
  const getBadgeColor = () => {
    if (ehAdmin) return '#FF9800'; // Vermelho para Admin
    if (ehDono) return '#FF9800';  // Laranja para Dono
    return '#2196F3';              // Azul para Cliente
  };

  return (
    <View style={styles.container}>
      <HomeHeader />
      <ScrollView style={dynamicStyles.scrollContent}>
        {/* Header do Perfil */}
        <View style={dynamicStyles.header}>
          {/* Ícone de usuário */}
          <View style={[dynamicStyles.avatarContainer, { backgroundColor: getBadgeColor() }]}>
            <Icon name="person" size={avatarIconSize} color="#FFF" />
          </View>

          {/* Nome do usuário */}
          <Text style={dynamicStyles.nome}>{usuario.nome_completo}</Text>

          {/* Badge de perfil */}
          <View style={[dynamicStyles.perfilBadge, { backgroundColor: getBadgeColor() }]}>
            <Text style={dynamicStyles.perfilBadgeText}>
              {usuario.perfil.nome_perfil}
            </Text>
          </View>
        </View>

        {/* Informações do usuário */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Informações</Text>

          {/* Email */}
          <View style={dynamicStyles.infoItem}>
            <Icon name="email" size={infoIconSize} color="#666" />
            <View style={dynamicStyles.infoContent}>
              <Text style={dynamicStyles.infoLabel}>Email</Text>
              <Text style={dynamicStyles.infoValue}>{usuario.email}</Text>
            </View>
          </View>

          {/* Telefone */}
          {usuario.telefone && (
            <View style={dynamicStyles.infoItem}>
              <Icon name="phone" size={infoIconSize} color="#666" />
              <View style={dynamicStyles.infoContent}>
                <Text style={dynamicStyles.infoLabel}>Telefone</Text>
                <Text style={dynamicStyles.infoValue}>{usuario.telefone}</Text>
              </View>
            </View>
          )}

          {/* Status da conta */}
          <View style={dynamicStyles.infoItem}>
            <Icon 
              name={usuario.ativo ? "check-circle" : "cancel"} 
              size={infoIconSize} 
              color={usuario.ativo ? "#4CAF50" : "#F44336"} 
            />
            <View style={dynamicStyles.infoContent}>
              <Text style={dynamicStyles.infoLabel}>Status da Conta</Text>
              <Text style={[
                dynamicStyles.infoValue,
                { color: usuario.ativo ? "#4CAF50" : "#F44336" }
              ]}>
                {usuario.ativo ? "Ativa" : "Inativa"}
              </Text>
            </View>
          </View>
        </View>

        {/* Ações */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Ações</Text>

          {/* Botão: Editar Perfil (futuro) */}
          <TouchableOpacity 
            style={dynamicStyles.actionButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                alert('Funcionalidade em desenvolvimento');
              } else {
                Alert.alert('Em breve', 'Funcionalidade de editar perfil em desenvolvimento');
              }
            }}
          >
            <Icon name="edit" size={actionIconSize} color="#2196F3" />
            <Text style={dynamicStyles.actionButtonText}>Editar Perfil</Text>
            <Icon name="chevron-right" size={chevronIconSize} color="#CCC" />
          </TouchableOpacity>

          {/* Botão: Trocar Senha (futuro) */}
          <TouchableOpacity 
            style={dynamicStyles.actionButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                alert('Funcionalidade em desenvolvimento');
              } else {
                Alert.alert('Em breve', 'Funcionalidade de trocar senha em desenvolvimento');
              }
            }}
          >
            <Icon name="lock" size={actionIconSize} color="#FF9800" />
            <Text style={dynamicStyles.actionButtonText}>Trocar Senha</Text>
            <Icon name="chevron-right" size={chevronIconSize} color="#CCC" />
          </TouchableOpacity>

          {/* Botão: Sair (LOGOUT) - Principal funcionalidade! */}
          <TouchableOpacity 
            style={[dynamicStyles.actionButton, dynamicStyles.logoutButton]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={actionIconSize} color="#F44336" />
            <Text style={[dynamicStyles.actionButtonText, dynamicStyles.logoutButtonText]}>
              Sair da Conta
            </Text>
            <Icon name="chevron-right" size={chevronIconSize} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* Informações adicionais */}
        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerText}>Cardap.io v1.0</Text>
          <Text style={dynamicStyles.footerText}>Sistema de Cardápio Digital</Text>
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

