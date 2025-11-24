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

  /**
   * Verifica se uma rota é pública (não requer autenticação)
   */
  const ehRotaPublica = (segmento: string): boolean => {
    const rotasPublicas = [
      'mesa', // Cardápio via QR code
      '(tabs)', // Tabs (cardápio, carrinho)
      '(auth)', // Login e registro
    ];
    return rotasPublicas.some(rota => segmento.startsWith(rota));
  };

  /**
   * Verifica se uma rota é protegida (requer autenticação)
   */
  const ehRotaProtegida = (segmento: string): boolean => {
    const rotasProtegidas = [
      'admin', // Todas as rotas administrativas
    ];
    return rotasProtegidas.some(rota => segmento.startsWith(rota));
  };

  useEffect(() => {
    if (carregando) return;

    const primeiroSegmento = segments[0] || '';
    const inAuthGroup = primeiroSegmento === '(auth)';

    // Se está na área de auth e está autenticado, redireciona para home
    if (autenticado && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    // Se não está autenticado e está tentando acessar rota protegida
    if (!autenticado && ehRotaProtegida(primeiroSegmento)) {
      router.replace('/login');
      return;
    }

    // Rotas públicas são permitidas sem autenticação
    // Não fazer redirecionamento automático para login
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
      <Stack.Screen 
        name="admin/mesas"
        options={{
          headerShown: true,
          title: 'Gerenciar Mesas',
        }}
      />
      <Stack.Screen 
        name="admin/mesas/[id]/qrcode"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="admin/mesas/[id]/fechar-conta"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="admin/mesas/[id]/pagamento"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="mesa/[qrCode]"
        options={{
          headerShown: false,
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
