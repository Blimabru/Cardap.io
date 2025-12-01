/**
 * Tela Inicial (Splash/Loading)
 * 
 * Esta tela é exibida brevemente enquanto verifica o estado de autenticação
 * e decide para onde redirecionar o usuário (login ou home)
 */

// Importações do React Native para componentes básicos
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
// Hook de navegação do Expo Router
import { useRouter } from 'expo-router';
// Context personalizado para gerenciar autenticação
import { useAuth } from '../contexts/AuthContext';

export default function IndexScreen() {
  // Obtém estado de autenticação e loading do context
  const { autenticado, carregando } = useAuth();
  // Hook para navegação programática
  const router = useRouter();

  useEffect(() => {
    // Só executa redirecionamento quando terminou de carregar dados de auth
    if (!carregando) {
      // Sempre redireciona para as abas principais (cardápio público)
      // O login é opcional - usuário pode navegar anonimamente
      // Áreas protegidas (admin) redirecionam para login quando necessário
      router.replace('/(tabs)');
    }
  }, [carregando]); // Re-executa quando carregando muda

  return (
    // Container centralizado para tela de loading
    <View style={styles.container}>
      {/* Indicador de carregamento (spinner) */}
      <ActivityIndicator size="large" color="#333" />
    </View>
  );
}

// Estilos da tela usando StyleSheet para otimização
const styles = StyleSheet.create({
  container: {
    // Ocupa toda a tela disponível
    flex: 1,
    // Centraliza conteúdo verticalmente
    justifyContent: 'center',
    // Centraliza conteúdo horizontalmente  
    alignItems: 'center',
    // Cor de fundo branca
    backgroundColor: '#FFF',
  },
});

