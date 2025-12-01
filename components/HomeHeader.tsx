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
  Platform,
  StyleSheet, // Container básico
  Text, // Componente de imagem
  TouchableOpacity,
  useWindowDimensions,
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
  // Dimensões da tela para responsividade
  const { width: screenWidth } = useWindowDimensions();
  // Estado de autenticação e dados do usuário
  const { autenticado, usuario } = useAuth();
  
  // Variáveis responsivas - totalmente responsivo até 412px
  const isVerySmallScreen = screenWidth < 320; // Telas muito pequenas
  const isSmallScreen = screenWidth >= 320 && screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;
  const isWeb = Platform.OS === 'web';
  
  // Padding responsivo - totalmente responsivo
  const headerPadding = isVerySmallScreen 
    ? 8 
    : isSmallScreen 
    ? 10 
    : isMediumScreen 
    ? 12 
    : isLargeScreen
    ? 15
    : Math.min(15, screenWidth * 0.04); // Responsivo para telas maiores
  const buttonPadding = isVerySmallScreen 
    ? 8 
    : isSmallScreen 
    ? 9 
    : isMediumScreen 
    ? 10 
    : isLargeScreen
    ? 12
    : Math.min(12, screenWidth * 0.03); // Responsivo para telas maiores
  
  // Calcular largura disponível para a logo - totalmente responsivo
  // Estimar largura do botão direito com margem de segurança MUITO generosa
  const buttonWidth = autenticado && usuario 
    ? (isVerySmallScreen ? 50 : isSmallScreen ? 55 : isMediumScreen ? 60 : isLargeScreen ? 65 : Math.min(65, screenWidth * 0.16))
    : (isVerySmallScreen ? 90 : isSmallScreen ? 100 : isMediumScreen ? 110 : isLargeScreen ? 120 : Math.min(120, screenWidth * 0.29));
  
  // Calcular largura máxima segura para a logo
  // Usar no máximo 40% da largura da tela, garantindo espaço MUITO generoso para o botão
  const totalPadding = headerPadding * 2; // Padding esquerdo + direito
  const totalMargin = 24; // Margem entre logo e botão (aumentada para 24px)
  const availableSpace = screenWidth - totalPadding - buttonWidth - totalMargin; // Sempre usar largura real
  
  // Tamanhos máximos - totalmente responsivo
  const maxLogoWidthByScreen = isVerySmallScreen 
    ? 70 
    : isSmallScreen 
    ? 80 
    : isMediumScreen 
    ? 100 
    : isWeb 
    ? 180 
    : isLargeScreen
    ? 110
    : Math.min(110, screenWidth * 0.27); // Responsivo para telas maiores
  
  // Usar o menor valor entre: 40% do espaço disponível e o máximo por tela
  const logoWidth = Math.min(
    availableSpace * 0.40, // Máximo 40% do espaço disponível (muito conservador)
    maxLogoWidthByScreen
  );
  
  // Garantir que a logo nunca seja menor que um tamanho mínimo legível
  const finalLogoWidth = Math.max(70, logoWidth);
  const logoHeight = (finalLogoWidth / 3) * 1; // Proporção aproximada 3:1
  
  const iconSize = isVerySmallScreen 
    ? 32 
    : isSmallScreen 
    ? 36 
    : isMediumScreen 
    ? 40 
    : isLargeScreen
    ? 44
    : Math.min(44, screenWidth * 0.11); // Responsivo para telas maiores
  
  return (
    <View style={[styles.header, { 
      paddingHorizontal: headerPadding,
      width: '100%', // Sempre responsivo
      maxWidth: '100%', // Sempre responsivo
    }]} collapsable={false}>
      <View style={[styles.headerContent, { 
        width: '100%',
        maxWidth: '100%',
      }]}>
      {/* Logo do aplicativo Cardap.io */}
      <View style={[styles.logoContainer, { maxWidth: finalLogoWidth }]}>
        <Image
          source={require('../assets/images/Logo.png')} // Logo local do projeto
          style={[styles.logo, { 
            width: finalLogoWidth, 
            height: logoHeight, 
            maxWidth: finalLogoWidth,
            maxHeight: logoHeight,
          }]}
          resizeMode="contain" // Mantém proporção da imagem
        />
      </View>
      
      {/* Renderização condicional baseada no estado de autenticação */}
      {autenticado && usuario ? (
        // Se usuário está logado: mostra foto de perfil clicável
        <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')} style={styles.rightButtonContainer}>
          <Image
            source={{ uri: usuario.foto_perfil_url || profileImageUrl }} // Foto do usuário ou padrão
            style={[styles.profileIcon, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }]}
            resizeMode="cover" // Preenche o container mantendo proporção
          />
        </TouchableOpacity>
      ) : (
        // Se usuário NÃO está logado: mostra botão de login
        <TouchableOpacity 
          style={[styles.loginButton, { paddingHorizontal: buttonPadding }]}
          onPress={() => router.push('/login')} // Navega para tela de login
        >
          <Icon name="person" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color="#333" /> {/* Fixo a partir de 412px */}
          <Text style={[styles.loginButtonText, { fontSize: isVerySmallScreen ? 12 : isSmallScreen ? 13 : 14 }]}>Entrar</Text> {/* Fixo a partir de 412px */}
        </TouchableOpacity>
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingBottom: 5,
    width: '100%',
    minHeight: 50, // Altura mínima para evitar cortes
    overflow: 'hidden', // Evitar overflow
    alignItems: 'center', // Centralizar conteúdo interno
    backgroundColor: '#F5CB58',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    flexShrink: 1, // Pode encolher se necessário
    minWidth: 0, // Permite encolher se necessário
    marginRight: 24, // Espaço entre logo e botão direito (aumentado para 24px)
    maxWidth: '40%', // Máximo 40% da largura do header (extremamente conservador)
    overflow: 'hidden', // Evitar que a logo ultrapasse
    justifyContent: 'flex-start', // Alinhar logo à esquerda
    alignItems: 'flex-start', // Alinhar logo ao topo
  },
  logo: {
    // Largura e altura serão definidas dinamicamente
    maxWidth: '100%', // Garante que não ultrapasse o container
    maxHeight: '100%', // Garante que não ultrapasse a altura
  },
  rightButtonContainer: {
    flexShrink: 0, // Não encolhe
    minWidth: 32, // Largura mínima
  },
  profileIcon: {
    backgroundColor: '#E0E0E0', 
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexShrink: 0, // Não encolhe
    minWidth: 60, // Largura mínima
  },
  loginButtonText: {
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeHeader;