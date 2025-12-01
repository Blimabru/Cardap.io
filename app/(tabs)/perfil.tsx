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
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import HomeHeader from '../../components/HomeHeader';

export default function PerfilScreen() {
  const { usuario, logout, ehAdmin, ehDono, ehCliente } = useAuth();
  const router = useRouter();

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
        <View style={styles.emptyContainer}>
          <Icon name="person" size={80} color="#DDD" />
          <Text style={styles.emptyText}>Faça login para acessar seu perfil</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Define cor do badge de perfil
  const getBadgeColor = () => {
    if (ehAdmin) return '#F44336'; // Vermelho para Admin
    if (ehDono) return '#FF9800';  // Laranja para Dono
    return '#2196F3';              // Azul para Cliente
  };

  return (
    <View style={styles.container}>
      <HomeHeader />
      <ScrollView style={styles.scrollContent}>
        {/* Header do Perfil */}
      <View style={styles.header}>
        {/* Ícone de usuário */}
        <View style={[styles.avatarContainer, { backgroundColor: getBadgeColor() }]}>
          <Icon name="person" size={60} color="#FFF" />
        </View>

        {/* Nome do usuário */}
        <Text style={styles.nome}>{usuario.nome_completo}</Text>

        {/* Badge de perfil */}
        <View style={[styles.perfilBadge, { backgroundColor: getBadgeColor() }]}>
          <Text style={styles.perfilBadgeText}>
            {usuario.perfil.nome_perfil}
          </Text>
        </View>
      </View>

      {/* Informações do usuário */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>

        {/* Email */}
        <View style={styles.infoItem}>
          <Icon name="email" size={24} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{usuario.email}</Text>
          </View>
        </View>

        {/* Telefone */}
        {usuario.telefone && (
          <View style={styles.infoItem}>
            <Icon name="phone" size={24} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{usuario.telefone}</Text>
            </View>
          </View>
        )}

        {/* Status da conta */}
        <View style={styles.infoItem}>
          <Icon 
            name={usuario.ativo ? "check-circle" : "cancel"} 
            size={24} 
            color={usuario.ativo ? "#4CAF50" : "#F44336"} 
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Status da Conta</Text>
            <Text style={[
              styles.infoValue,
              { color: usuario.ativo ? "#4CAF50" : "#F44336" }
            ]}>
              {usuario.ativo ? "Ativa" : "Inativa"}
            </Text>
          </View>
        </View>
      </View>

      {/* Ações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>

        {/* Botão: Editar Perfil (futuro) */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              alert('Funcionalidade em desenvolvimento');
            } else {
              Alert.alert('Em breve', 'Funcionalidade de editar perfil em desenvolvimento');
            }
          }}
        >
          <Icon name="edit" size={24} color="#2196F3" />
          <Text style={styles.actionButtonText}>Editar Perfil</Text>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* Botão: Trocar Senha (futuro) */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              alert('Funcionalidade em desenvolvimento');
            } else {
              Alert.alert('Em breve', 'Funcionalidade de trocar senha em desenvolvimento');
            }
          }}
        >
          <Icon name="lock" size={24} color="#FF9800" />
          <Text style={styles.actionButtonText}>Trocar Senha</Text>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* Botão: Sair (LOGOUT) - Principal funcionalidade! */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#F44336" />
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            Sair da Conta
          </Text>
          <Icon name="chevron-right" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      {/* Informações adicionais */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Cardap.io v1.0</Text>
        <Text style={styles.footerText}>Sistema de Cardápio Digital</Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flex: 1,
  },
  
  // Header com avatar e nome
  header: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  perfilBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  perfilBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Seções
  section: {
    backgroundColor: '#FFF',
    marginTop: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
  },

  // Item de informação
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },

  // Botões de ação
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
    borderBottomWidth: 0,
  },
  logoutButtonText: {
    color: '#F44336',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },

  // Erro
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

