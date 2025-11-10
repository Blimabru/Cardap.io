/**
 * Tela Inicial
 * 
 * Redireciona para login ou tabs baseado em autenticação
 */

import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function IndexScreen() {
  const { autenticado, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando) {
      if (autenticado) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [autenticado, carregando]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#333" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});

