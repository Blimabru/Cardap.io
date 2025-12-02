/**
 * ============================================================================
 * REGISTRO.TSX - TELA DE CADASTRO DE NOVOS USUÁRIOS
 * ============================================================================
 * 
 * Esta tela permite que novos usuários se cadastrem no sistema Cardap.io.
 * 
 * FUNCIONALIDADES:
 * - Formulário de cadastro com campos: nome completo, email, telefone, senha
 * - Validação de campos obrigatórios
 * - Validação de confirmação de senha
 * - Validação de tamanho mínimo de senha (6 caracteres)
 * - Integração com contexto de autenticação (AuthContext)
 * - Navegação para tela de login
 * - Layout responsivo para diferentes tamanhos de tela
 * - ScrollView para acomodar formulário em telas pequenas
 * 
 * FLUXO DE CADASTRO:
 * 1. Usuário preenche todos os campos obrigatórios
 * 2. Clica em "Criar Conta"
 * 3. Sistema valida campos e senhas
 * 4. Chama função registro() do AuthContext
 * 5. Se sucesso: redireciona para tela principal (/(tabs))
 * 6. Se erro: exibe mensagem de erro
 * 
 * ESTADO GERENCIADO:
 * - nomeCompleto: string - Nome completo do usuário
 * - email: string - Email do usuário
 * - telefone: string - Telefone do usuário (opcional)
 * - senha: string - Senha escolhida pelo usuário
 * - confirmarSenha: string - Confirmação da senha
 * - carregando: boolean - Indica se está processando o cadastro
 */

// Importação do React e hooks necessários
import React, { useState } from 'react';
// Importação de componentes do React Native
import {
  View, // Container básico
  Text, // Componente de texto
  TextInput, // Componente de input de texto
  TouchableOpacity, // Botão tocável com feedback visual
  StyleSheet, // Utilitário para criar estilos otimizados
  Alert, // Componente para exibir alertas/diálogos
  ActivityIndicator, // Componente de loading (spinner)
  KeyboardAvoidingView, // Componente que ajusta layout quando teclado aparece
  Platform, // Utilitário para detectar plataforma (iOS/Android/Web)
  ScrollView, // Componente de scroll para conteúdo longo
  Image, // Componente para exibir imagens
  useWindowDimensions, // Hook para obter dimensões da janela/tela
} from 'react-native';
// Importação do hook de navegação do Expo Router
import { useRouter } from 'expo-router';
// Importação do contexto de autenticação
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente principal da tela de registro
 * 
 * @returns JSX.Element - Renderiza a interface de cadastro
 */
export default function RegistroScreen() {
  // Hook de navegação para mudar de tela após registro bem-sucedido
  const router = useRouter();
  // Função de registro do contexto de autenticação
  const { registro } = useAuth();
  // Obtém a largura da tela para cálculos responsivos
  const { width: screenWidth } = useWindowDimensions();

  // ============================================================================
  // VARIÁVEIS RESPONSIVAS - Breakpoints para diferentes tamanhos de tela
  // ============================================================================
  // Telas pequenas: menor que 375px (ex: iPhone SE)
  const isSmallScreen = screenWidth < 375;
  // Telas médias: entre 375px e 412px (ex: iPhone 12/13)
  const isMediumScreen = screenWidth >= 375 && screenWidth < 412;
  // Telas grandes: 412px ou maior (ex: tablets, web)
  const isLargeScreen = screenWidth >= 412;
  // Detecta se está rodando na web
  const isWeb = Platform.OS === 'web';

  // ============================================================================
  // ESTADOS LOCAIS - Gerenciam o estado do formulário
  // ============================================================================
  // Estado para armazenar o nome completo digitado pelo usuário
  const [nomeCompleto, setNomeCompleto] = useState('');
  // Estado para armazenar o email digitado pelo usuário
  const [email, setEmail] = useState('');
  // Estado para armazenar o telefone digitado pelo usuário (opcional)
  const [telefone, setTelefone] = useState('');
  // Estado para armazenar a senha digitada pelo usuário
  const [senha, setSenha] = useState('');
  // Estado para armazenar a confirmação da senha
  const [confirmarSenha, setConfirmarSenha] = useState('');
  // Estado para controlar o loading durante o processo de registro
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
    const subtitleFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const labelFontSize = isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    const inputFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const buttonFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    const linkFontSize = isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);

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
      scrollContent: {
        flexGrow: 1,
        paddingHorizontal: horizontalPadding,
        paddingTop: isSmallScreen ? 40 : isMediumScreen ? 50 : isLargeScreen ? 60 : Math.min(60, screenWidth * 0.146),
        paddingBottom: isSmallScreen ? 32 : isMediumScreen ? 36 : isLargeScreen ? 40 : Math.min(40, screenWidth * 0.098),
        width: '100%',
        maxWidth: '100%',
      },
      header: {
        marginBottom: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078),
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
    });
  };

  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen, isWeb);

  const handleRegistro = async () => {
    // Validações
    if (!nomeCompleto || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setCarregando(true);
    try {
      await registro({
        nome_completo: nomeCompleto,
        email,
        senha,
        telefone: telefone || undefined,
      });
      router.replace('/(tabs)');
    } catch (erro: any) {
      Alert.alert(
        'Erro ao criar conta',
        erro.message || 'Ocorreu um erro. Tente novamente.'
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
      <ScrollView 
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={dynamicStyles.header}>
          {/* Logo Cardap.io */}
          <View style={dynamicStyles.logoContainer}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={dynamicStyles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={dynamicStyles.subtitle}>Crie sua conta gratuitamente</Text>
        </View>

        <View style={dynamicStyles.form}>
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Nome Completo *</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="João Silva"
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
              editable={!carregando}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Email *</Text>
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
            <Text style={dynamicStyles.label}>Telefone</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="(11) 99999-9999"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
              editable={!carregando}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Senha *</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              editable={!carregando}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Confirmar Senha *</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
              editable={!carregando}
            />
          </View>

          <TouchableOpacity
            style={[dynamicStyles.button, carregando && styles.buttonDisabled]}
            onPress={handleRegistro}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={dynamicStyles.buttonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.linkButton}
            onPress={() => router.back()}
            disabled={carregando}
          >
            <Text style={dynamicStyles.linkText}>
              Já tem conta? <Text style={styles.linkTextBold}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

