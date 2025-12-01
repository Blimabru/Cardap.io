/**
 * ============================================================================
 * HOMEHEADER.TSX - COMPONENTE DE HEADER DA TELA PRINCIPAL
 * ============================================================================
 * 
 * Header personalizado exibido no topo da tela de cardápio (home).
 * 
 * FUNCIONALIDADES:
 * - Exibe logo do aplicativo
 * - Mostra foto do perfil (se usuário logado) ou botão de login
 * - Navegação para perfil ao tocar na foto
 * - Navegação para login ao tocar no botão "Entrar"
 * 
 * COMPORTAMENTO CONDICIONAL:
 * - Usuário logado: mostra foto de perfil
 * - Usuário não logado: mostra botão "Entrar"
 * 
 * USO:
 * <HomeHeader /> (usado na tela index.tsx)
 */

import React from 'react';
// Componentes básicos do React Native
import {
  Image, // Componente de texto
  StyleSheet, // Container básico
  Text, // Componente de imagem
  TouchableOpacity,
  View, // Container básico
} from 'react-native';
// Hook de navegação
import { useRouter } from 'expo-router';
// Ícones Material Design
import { MaterialIcons as Icon } from '@expo/vector-icons';
// Contexto de autenticação
import { useAuth } from '../contexts/AuthContext';

// URL de imagem padrão para usuários sem foto de perfil
const profileImageUrl = 'https://noticiasdatv.uol.com.br/media/_versions/everybody-hates-chris-julius-dia-dos-pais_fixed_large.jpg';

const HomeHeader = () => {
  // Hook para navegação programática
  const router = useRouter();
  // Estado de autenticação e dados do usuário
  const { autenticado, usuario } = useAuth();

  return (
    <View style={styles.header}>
      {/* Logo do aplicativo Cardap.io */}
      <Image
        source={require('../assets/images/Logobranca.png')} // Logo local do projeto
        style={styles.logo}
        resizeMode="contain" // Mantém proporção da imagem
      />
      
      {/* Renderização condicional baseada no estado de autenticação */}
      {autenticado && usuario ? (
        // Se usuário está logado: mostra foto de perfil clicável
        <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
          <Image
            source={{ uri: usuario.foto_perfil_url || profileImageUrl }} // Foto do usuário ou padrão
            style={styles.profileIcon}
            resizeMode="cover" // Preenche o container mantendo proporção
          />
        </TouchableOpacity>
      ) : (
        // Se usuário NÃO está logado: mostra botão de login
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login')} // Navega para tela de login
        >
          <Icon name="person" size={20} color="#333" />
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#F59930',
  },
  logo: {
    width: 180,
    height: 60,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22, 
    backgroundColor: '#E0E0E0', 
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeHeader;