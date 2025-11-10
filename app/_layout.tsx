/**
 * Layout Raiz da Aplicação
 * 
 * Configura providers globais e navegação
 */

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CarrinhoProvider } from '../contexts/CarrinhoContext';

function RootLayoutNav() {
  const { autenticado, carregando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!autenticado && !inAuthGroup) {
      // Se não está autenticado e não está na área de auth, redireciona para login
      router.replace('/login');
    } else if (autenticado && inAuthGroup) {
      // Se está autenticado e está na área de auth, redireciona para home
      router.replace('/(tabs)');
    }
  }, [autenticado, segments, carregando]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/registro" />
      <Stack.Screen 
        name="admin/produtos"
        options={{
          headerShown: true,
          title: 'Gerenciar Produtos',
        }}
      />
      <Stack.Screen 
        name="admin/categorias"
        options={{
          headerShown: true,
          title: 'Gerenciar Categorias',
        }}
      />
      <Stack.Screen 
        name="admin/todos-pedidos"
        options={{
          headerShown: true,
          title: 'Todos os Pedidos',
        }}
      />
      <Stack.Screen 
        name="admin/usuarios"
        options={{
          headerShown: true,
          title: 'Gerenciar Usuários',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <RootLayoutNav />
      </CarrinhoProvider>
    </AuthProvider>
  );
}
