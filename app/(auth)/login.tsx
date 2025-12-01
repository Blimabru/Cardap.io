/**
 * Tela de Login
 * 
 * Permite que usuários façam login no sistema
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { width: screenWidth } = useWindowDimensions();

  // Variáveis responsivas baseadas na largura da tela
  const isSmallScreen = screenWidth < 375;
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  const isLargeScreen = screenWidth >= 412;
  const isWeb = Platform.OS === 'web';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Função para criar estilos dinâmicos baseados no tamanho da tela
  const createDynamicStyles = (
    screenWidth: number,
    isSmallScreen: boolean,
    isMediumScreen: boolean,
    isLargeScreen: boolean,
    isWeb: boolean
  ) => {
    // Padding horizontal responsivo
    const horizontalPadding = isSmallScreen 
      ? 16 
      : isMediumScreen 
      ? 20 
      : isLargeScreen
      ? 24
      : Math.min(24, screenWidth * 0.058);

    // Tamanhos de fonte responsivos
    const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const subtitleFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const labelFontSize = isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    const inputFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const buttonFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const linkFontSize = isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    const demoFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);

    // Tamanhos de logo responsivos
    const logoWidth = isSmallScreen 
      ? Math.min(200, screenWidth * 0.6)
      : isMediumScreen 
      ? Math.min(240, screenWidth * 0.58)
      : isLargeScreen
      ? Math.min(280, screenWidth * 0.68)
      : Math.min(280, screenWidth * 0.68);
    const logoHeight = logoWidth * 0.43; // Proporção aproximada

    // Padding de inputs responsivo
    const inputPaddingH = isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const inputPaddingV = isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);

    // Padding de botão responsivo
    const buttonPaddingV = isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);

    return StyleSheet.create({
      content: {
        flex: 1,
        paddingHorizontal: horizontalPadding,
        justifyContent: 'center',
        width: '100%',
        maxWidth: '100%',
      },
      logoContainer: {
        alignItems: 'center',
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
      },
      logoImage: {
        width: logoWidth,
        height: logoHeight,
        maxWidth: '100%',
      },
      subtitle: {
        fontSize: subtitleFontSize,
        color: '#666',
        textAlign: 'center',
        marginBottom: isSmallScreen ? 32 : isMediumScreen ? 40 : isLargeScreen ? 48 : Math.min(48, screenWidth * 0.117),
      },
      form: {
        width: '100%',
        maxWidth: '100%',
      },
      inputContainer: {
        marginBottom: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049),
      },
      label: {
        fontSize: labelFontSize,
        fontWeight: '600',
        color: '#333',
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
      },
      input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: inputPaddingH,
        paddingVertical: inputPaddingV,
        fontSize: inputFontSize,
        color: '#333',
        width: '100%',
        maxWidth: '100%',
      },
      button: {
        backgroundColor: '#333',
        borderRadius: 8,
        paddingVertical: buttonPaddingV,
        alignItems: 'center',
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019),
        width: '100%',
      },
      buttonText: {
        color: '#FFF',
        fontSize: buttonFontSize,
        fontWeight: '600',
      },
      linkButton: {
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        alignItems: 'center',
      },
      linkText: {
        fontSize: linkFontSize,
        color: '#666',
      },
      demoContainer: {
        marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039),
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
      },
      demoTitle: {
        fontSize: demoFontSize,
        fontWeight: '600',
        color: '#666',
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010),
      },
      demoText: {
        fontSize: demoFontSize,
        color: '#888',
      },
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen, isWeb);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    setCarregando(true);
    try {
      await login({ email, senha });
      router.replace('/(tabs)');
    } catch (erro: any) {
      Alert.alert(
        'Erro ao fazer login',
        erro.message || 'Verifique suas credenciais e tente novamente'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={dynamicStyles.content}>
        {/* Logo Cardap.io */}
        <View style={dynamicStyles.logoContainer}>
          <Image
            source={require('../../assets/images/Logo.png')}
            style={dynamicStyles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={dynamicStyles.subtitle}>Faça login para continuar</Text>

        <View style={dynamicStyles.form}>
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Email</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!carregando}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Senha</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="••••••••"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!carregando}
            />
          </View>

          <TouchableOpacity
            style={[dynamicStyles.button, carregando && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={dynamicStyles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.linkButton}
            onPress={() => router.push('/registro')}
            disabled={carregando}
          >
            <Text style={dynamicStyles.linkText}>
              Não tem conta? <Text style={styles.linkTextBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.demoContainer}>
          <Text style={dynamicStyles.demoTitle}>Contas de Demonstração:</Text>
          <Text style={dynamicStyles.demoText}>Admin: admin@cardapio.com / admin123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkTextBold: {
    fontWeight: '600',
    color: '#333',
  },
});

