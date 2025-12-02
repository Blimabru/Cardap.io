/**
 * ============================================================================
 * LOGIN.TSX - TELA DE AUTENTICAÇÃO (LOGIN)
 * ============================================================================
 * 
 * Esta tela permite que usuários façam login no sistema Cardap.io.
 * 
 * FUNCIONALIDADES:
 * - Campo de email para autenticação
 * - Campo de senha (oculto) para segurança
 * - Validação de campos obrigatórios
 * - Integração com contexto de autenticação (AuthContext)
 * - Navegação para tela de registro
 * - Exibição de contas de demonstração
 * - Layout responsivo para diferentes tamanhos de tela
 * 
 * FLUXO DE AUTENTICAÇÃO:
 * 1. Usuário preenche email e senha
 * 2. Clica em "Entrar"
 * 3. Sistema valida se campos estão preenchidos
 * 4. Chama função login() do AuthContext
 * 5. Se sucesso: redireciona para tela principal (/(tabs))
 * 6. Se erro: exibe mensagem de erro
 * 
 * ESTADO GERENCIADO:
 * - email: string - Email digitado pelo usuário
 * - senha: string - Senha digitada pelo usuário
 * - carregando: boolean - Indica se está processando o login
 */

// Importação do hook de navegação do Expo Router
import { useRouter } from 'expo-router';
// Importação do React e hooks necessários
import React, { useState } from 'react';
// Importação de componentes do React Native
import {
  ActivityIndicator, // Componente de loading (spinner)
  Alert, // Componente para exibir alertas/diálogos
  Image, // Componente para exibir imagens
  KeyboardAvoidingView, // Componente que ajusta layout quando teclado aparece
  Platform, // Utilitário para detectar plataforma (iOS/Android/Web)
  StyleSheet, // Utilitário para criar estilos otimizados
  Text, // Componente de texto
  TextInput, // Componente de input de texto
  TouchableOpacity, // Botão tocável com feedback visual
  useWindowDimensions, // Hook para obter dimensões da janela/tela
  View, // Container básico
} from 'react-native';
// Importação do contexto de autenticação
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente principal da tela de login
 * 
 * @returns JSX.Element - Renderiza a interface de login
 */
export default function LoginScreen() {
  // Hook de navegação para mudar de tela após login bem-sucedido
  const router = useRouter();
  // Função de login do contexto de autenticação
  const { login } = useAuth();
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
  // Estado para armazenar o email digitado pelo usuário
  const [email, setEmail] = useState('');
  // Estado para armazenar a senha digitada pelo usuário
  const [senha, setSenha] = useState('');
  // Estado para controlar o loading durante o processo de login
  const [carregando, setCarregando] = useState(false);

  // ============================================================================
  // FUNÇÃO DE ESTILOS DINÂMICOS - Cria estilos responsivos baseados no tamanho da tela
  // ============================================================================
  /**
   * Cria um objeto StyleSheet com estilos que se adaptam ao tamanho da tela
   * 
   * @param screenWidth - Largura atual da tela em pixels
   * @param isSmallScreen - Boolean indicando se é tela pequena (< 375px)
   * @param isMediumScreen - Boolean indicando se é tela média (375-412px)
   * @param isLargeScreen - Boolean indicando se é tela grande (>= 412px)
   * @param isWeb - Boolean indicando se está rodando na web
   * @returns StyleSheet - Objeto de estilos criado dinamicamente
   */
  const createDynamicStyles = (
    screenWidth: number,
    isSmallScreen: boolean,
    isMediumScreen: boolean,
    isLargeScreen: boolean,
    isWeb: boolean
  ) => {
    // ========================================================================
    // CÁLCULOS DE DIMENSÕES RESPONSIVAS
    // ========================================================================
    // Padding horizontal: espaçamento lateral do conteúdo
    // Em telas pequenas: 16px fixo
    // Em telas médias: 20px fixo
    // Em telas grandes: 24px fixo ou proporcional (5.8% da largura)
    const horizontalPadding = isSmallScreen 
      ? 16 
      : isMediumScreen 
      ? 20 
      : isLargeScreen
      ? 24
      : Math.min(24, screenWidth * 0.058);

    // Tamanhos de fonte responsivos para diferentes elementos
    // titleFontSize: Tamanho da fonte do título principal (18-20px)
    const titleFontSize = isSmallScreen ? 18 : isMediumScreen ? 20 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049);
    // bodyFontSize: Tamanho da fonte do corpo do texto (14-16px)
    const bodyFontSize = isSmallScreen ? 14 : isMediumScreen ? 16 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    // subtitleFontSize: Tamanho da fonte do subtítulo (14-16px)
    const subtitleFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    // labelFontSize: Tamanho da fonte dos labels dos campos (13-14px)
    const labelFontSize = isSmallScreen ? 13 : isMediumScreen ? 14 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    // inputFontSize: Tamanho da fonte dentro dos inputs (14-16px)
    const inputFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    // buttonFontSize: Tamanho da fonte dos botões (14-16px)
    const buttonFontSize = isSmallScreen ? 14 : isMediumScreen ? 15 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    // linkFontSize: Tamanho da fonte dos links (12-14px)
    const linkFontSize = isSmallScreen ? 12 : isMediumScreen ? 13 : isLargeScreen ? 14 : Math.min(14, screenWidth * 0.034);
    // demoFontSize: Tamanho da fonte do texto de demonstração (11-12px)
    const demoFontSize = isSmallScreen ? 11 : isMediumScreen ? 12 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);

    // Tamanhos de logo responsivos
    // logoWidth: Largura do logo (60-68% da largura da tela, máximo 200-280px)
    const logoWidth = isSmallScreen 
      ? Math.min(200, screenWidth * 0.6)  // Tela pequena: 60% da largura, máximo 200px
      : isMediumScreen 
      ? Math.min(240, screenWidth * 0.58) // Tela média: 58% da largura, máximo 240px
      : isLargeScreen
      ? Math.min(280, screenWidth * 0.68) // Tela grande: 68% da largura, máximo 280px
      : Math.min(280, screenWidth * 0.68);
    // logoHeight: Altura do logo (43% da largura para manter proporção)
    const logoHeight = logoWidth * 0.43; // Proporção aproximada do logo

    // Padding de inputs responsivo
    // inputPaddingH: Padding horizontal interno dos inputs (12-16px)
    const inputPaddingH = isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);
    // inputPaddingV: Padding vertical interno dos inputs (10-12px)
    const inputPaddingV = isSmallScreen ? 10 : isMediumScreen ? 11 : isLargeScreen ? 12 : Math.min(12, screenWidth * 0.029);

    // Padding de botão responsivo
    // buttonPaddingV: Padding vertical do botão de login (12-16px)
    const buttonPaddingV = isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039);

    // ========================================================================
    // CRIAÇÃO DO OBJETO DE ESTILOS
    // ========================================================================
    return StyleSheet.create({
      // Container principal do conteúdo (centralizado verticalmente)
      content: {
        flex: 1, // Ocupa todo o espaço disponível
        paddingHorizontal: horizontalPadding, // Padding lateral responsivo
        justifyContent: 'center', // Centraliza conteúdo verticalmente
        width: '100%', // Largura total
        maxWidth: '100%', // Máximo de largura (evita overflow)
      },
      // Container do logo (centralizado horizontalmente)
      logoContainer: {
        alignItems: 'center', // Centraliza o logo horizontalmente
        marginBottom: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039), // Espaçamento inferior responsivo
      },
      // Estilo da imagem do logo
      logoImage: {
        width: logoWidth, // Largura calculada dinamicamente
        height: logoHeight, // Altura calculada dinamicamente (proporcional)
        maxWidth: '100%', // Garante que não ultrapasse a tela
      },
      // Estilo do subtítulo ("Faça login para continuar")
      subtitle: {
        fontSize: subtitleFontSize, // Tamanho de fonte responsivo
        color: '#666', // Cor cinza médio
        textAlign: 'center', // Texto centralizado
        marginBottom: isSmallScreen ? 32 : isMediumScreen ? 40 : isLargeScreen ? 48 : Math.min(48, screenWidth * 0.117), // Espaçamento inferior responsivo
      },
      // Container do formulário
      form: {
        width: '100%', // Largura total
        maxWidth: '100%', // Máximo de largura
      },
      // Container de cada campo de input (email, senha)
      inputContainer: {
        marginBottom: isSmallScreen ? 16 : isMediumScreen ? 18 : isLargeScreen ? 20 : Math.min(20, screenWidth * 0.049), // Espaçamento inferior entre campos
      },
      // Estilo do label (texto acima do input)
      label: {
        fontSize: labelFontSize, // Tamanho de fonte responsivo
        fontWeight: '600', // Peso da fonte (semi-bold)
        color: '#333', // Cor preta suave
        marginBottom: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019), // Espaçamento entre label e input
      },
      // Estilo do campo de input (TextInput)
      input: {
        borderWidth: 1, // Largura da borda
        borderColor: '#DDD', // Cor da borda (cinza claro)
        borderRadius: 8, // Bordas arredondadas
        paddingHorizontal: inputPaddingH, // Padding horizontal interno
        paddingVertical: inputPaddingV, // Padding vertical interno
        fontSize: inputFontSize, // Tamanho da fonte do texto digitado
        color: '#333', // Cor do texto digitado
        width: '100%', // Largura total
        maxWidth: '100%', // Máximo de largura
      },
      // Estilo do botão de login
      button: {
        backgroundColor: '#333', // Cor de fundo preta
        borderRadius: 8, // Bordas arredondadas
        paddingVertical: buttonPaddingV, // Padding vertical responsivo
        alignItems: 'center', // Centraliza conteúdo horizontalmente
        marginTop: isSmallScreen ? 6 : isMediumScreen ? 7 : isLargeScreen ? 8 : Math.min(8, screenWidth * 0.019), // Espaçamento superior
        width: '100%', // Largura total
      },
      // Estilo do texto do botão
      buttonText: {
        color: '#FFF', // Cor branca do texto
        fontSize: buttonFontSize, // Tamanho de fonte responsivo
        fontWeight: '600', // Peso da fonte (semi-bold)
      },
      // Container do link "Não tem conta?"
      linkButton: {
        marginTop: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039), // Espaçamento superior responsivo
        alignItems: 'center', // Centraliza o link
      },
      // Estilo do texto do link
      linkText: {
        fontSize: linkFontSize, // Tamanho de fonte responsivo
        color: '#666', // Cor cinza médio
      },
      // Container das informações de demonstração (contas de teste)
      demoContainer: {
        marginTop: isSmallScreen ? 24 : isMediumScreen ? 28 : isLargeScreen ? 32 : Math.min(32, screenWidth * 0.078), // Espaçamento superior responsivo
        padding: isSmallScreen ? 12 : isMediumScreen ? 14 : isLargeScreen ? 16 : Math.min(16, screenWidth * 0.039), // Padding interno responsivo
        backgroundColor: '#F5F5F5', // Cor de fundo cinza muito claro
        borderRadius: 8, // Bordas arredondadas
      },
      // Estilo do título da seção de demonstração
      demoTitle: {
        fontSize: demoFontSize, // Tamanho de fonte responsivo
        fontWeight: '600', // Peso da fonte (semi-bold)
        color: '#666', // Cor cinza médio
        marginBottom: isSmallScreen ? 3 : isMediumScreen ? 4 : isLargeScreen ? 4 : Math.min(4, screenWidth * 0.010), // Espaçamento inferior
      },
      // Estilo do texto de demonstração (credenciais de teste)
      demoText: {
        fontSize: demoFontSize, // Tamanho de fonte responsivo
        color: '#888', // Cor cinza escuro
      },
    });
  };

  // Cria os estilos dinâmicos baseados nas dimensões da tela
  const dynamicStyles = createDynamicStyles(screenWidth, isSmallScreen, isMediumScreen, isLargeScreen, isWeb);

  // ============================================================================
  // HANDLER DE LOGIN - Processa a autenticação do usuário
  // ============================================================================
  /**
   * Função assíncrona que processa o login do usuário
   * 
   * Fluxo:
   * 1. Valida se email e senha foram preenchidos
   * 2. Ativa estado de carregamento
   * 3. Chama função login() do contexto de autenticação
   * 4. Se sucesso: redireciona para tela principal
   * 5. Se erro: exibe mensagem de erro
   * 6. Desativa estado de carregamento (finally)
   */
  const handleLogin = async () => {
    // Validação: verifica se ambos os campos estão preenchidos
    if (!email || !senha) {
      // Exibe alerta se campos estiverem vazios
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return; // Interrompe a execução
    }

    // Ativa o estado de carregamento (mostra spinner no botão)
    setCarregando(true);
    try {
      // Chama a função de login do contexto de autenticação
      // Passa email e senha como objeto
      await login({ email, senha });
      // Se login bem-sucedido, redireciona para tela principal
      // replace() substitui a tela atual (usuário não pode voltar)
      router.replace('/(tabs)');
    } catch (erro: any) {
      // Se ocorrer erro, exibe mensagem de erro
      Alert.alert(
        'Erro ao fazer login',
        erro.message || 'Verifique suas credenciais e tente novamente'
      );
    } finally {
      // Sempre desativa o carregamento, independente de sucesso ou erro
      setCarregando(false);
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ============================================================================
  return (
    // KeyboardAvoidingView: Ajusta o layout quando o teclado aparece
    // behavior: Define como o layout será ajustado (padding no iOS, height no Android)
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Container principal do conteúdo */}
      <View style={dynamicStyles.content}>
        {/* Container do logo Cardap.io */}
        <View style={dynamicStyles.logoContainer}>
          {/* Imagem do logo */}
          <Image
            source={require('../../assets/images/Logo.png')} // Caminho da imagem do logo
            style={dynamicStyles.logoImage} // Estilos dinâmicos aplicados
            resizeMode="contain" // Mantém proporção da imagem
          />
        </View>
        {/* Subtítulo informativo */}
        <Text style={dynamicStyles.subtitle}>Faça login para continuar</Text>

        {/* Formulário de login */}
        <View style={dynamicStyles.form}>
          {/* Campo de Email */}
          <View style={dynamicStyles.inputContainer}>
            {/* Label do campo */}
            <Text style={dynamicStyles.label}>Email</Text>
            {/* Input de email */}
            <TextInput
              style={dynamicStyles.input} // Estilos dinâmicos
              placeholder="seu@email.com" // Texto de placeholder
              value={email} // Valor controlado pelo estado
              onChangeText={setEmail} // Atualiza estado quando texto muda
              autoCapitalize="none" // Não capitaliza automaticamente
              keyboardType="email-address" // Teclado otimizado para email
              editable={!carregando} // Desabilita durante carregamento
            />
          </View>

          {/* Campo de Senha */}
          <View style={dynamicStyles.inputContainer}>
            {/* Label do campo */}
            <Text style={dynamicStyles.label}>Senha</Text>
            {/* Input de senha */}
            <TextInput
              style={dynamicStyles.input} // Estilos dinâmicos
              placeholder="••••••••" // Placeholder com pontos (oculta senha)
              value={senha} // Valor controlado pelo estado
              onChangeText={setSenha} // Atualiza estado quando texto muda
              secureTextEntry // Oculta o texto digitado (senha)
              editable={!carregando} // Desabilita durante carregamento
            />
          </View>

          {/* Botão de Login */}
          <TouchableOpacity
            style={[dynamicStyles.button, carregando && styles.buttonDisabled]} // Estilo normal + estilo desabilitado se carregando
            onPress={handleLogin} // Função executada ao clicar
            disabled={carregando} // Desabilita botão durante carregamento
          >
            {/* Mostra spinner se carregando, senão mostra texto */}
            {carregando ? (
              <ActivityIndicator color="#FFF" /> // Spinner branco
            ) : (
              <Text style={dynamicStyles.buttonText}>Entrar</Text> // Texto do botão
            )}
          </TouchableOpacity>

          {/* Link para tela de registro */}
          <TouchableOpacity
            style={dynamicStyles.linkButton} // Estilos do container do link
            onPress={() => router.push('/registro')} // Navega para tela de registro
            disabled={carregando} // Desabilita durante carregamento
          >
            {/* Texto do link com parte em negrito */}
            <Text style={dynamicStyles.linkText}>
              Não tem conta? <Text style={styles.linkTextBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Container com informações de contas de demonstração */}
        <View style={dynamicStyles.demoContainer}>
          {/* Título da seção */}
          <Text style={dynamicStyles.demoTitle}>Contas de Demonstração:</Text>
          {/* Credenciais de teste (Admin) */}
          <Text style={dynamicStyles.demoText}>Admin: admin@cardapio.com / admin123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// ESTILOS ESTÁTICOS - Estilos que não mudam com o tamanho da tela
// ============================================================================
const styles = StyleSheet.create({
  // Container principal da tela
  container: {
    flex: 1, // Ocupa todo o espaço disponível
    backgroundColor: '#FFFFFF', // Cor de fundo branca
    width: '100%', // Largura total
  },
  // Container de input (estilo estático - não usado, mantido para compatibilidade)
  inputContainer: {
    marginBottom: 20, // Espaçamento inferior
  },
  // Label de input (estilo estático - não usado, mantido para compatibilidade)
  label: {
    fontSize: 14, // Tamanho de fonte
    fontWeight: '600', // Peso da fonte (semi-bold)
    color: '#333', // Cor preta suave
    marginBottom: 8, // Espaçamento inferior
  },
  // Input (estilo estático - não usado, mantido para compatibilidade)
  input: {
    borderWidth: 1, // Largura da borda
    borderColor: '#DDD', // Cor da borda (cinza claro)
    borderRadius: 8, // Bordas arredondadas
    paddingHorizontal: 16, // Padding horizontal
    paddingVertical: 12, // Padding vertical
    fontSize: 16, // Tamanho da fonte
    color: '#363636ff', // Cor do texto
  },
  // Botão (estilo estático - não usado, mantido para compatibilidade)
  button: {
    backgroundColor: '#E95322', // Cor de fundo laranja
    borderRadius: 8, // Bordas arredondadas
    paddingVertical: 16, // Padding vertical
    alignItems: 'center', // Centraliza conteúdo
    marginTop: 8, // Espaçamento superior
  },
  // Estilo aplicado quando botão está desabilitado
  buttonDisabled: {
    opacity: 0.6, // Reduz opacidade para indicar estado desabilitado
  },
  // Texto em negrito dentro do link
  linkTextBold: {
    fontWeight: '600', // Peso da fonte (semi-bold)
    color: '#333', // Cor preta suave
  },
});

