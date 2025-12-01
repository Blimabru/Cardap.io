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
    // Se ainda está carregando dados de autenticação, não faz nada
    if (carregando) return;

    // Obtém o primeiro segmento da URL atual
    const primeiroSegmento = segments[0] || '';
    // Verifica se está nas telas de autenticação
    const inAuthGroup = primeiroSegmento === '(auth)';

    // Se usuário está logado e tentando acessar login/registro, redireciona para home
    if (autenticado && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    // Se usuário NÃO está logado e tenta acessar área administrativa, redireciona para login
    if (!autenticado && ehRotaProtegida(primeiroSegmento)) {
      router.replace('/login');
      return;
    }

    // Rotas públicas (cardápio, carrinho) são permitidas sem autenticação
    // Não fazemos redirecionamento automático para login para permitir uso anônimo
  }, [autenticado, segments, carregando]);

  return (
    // Stack Navigator - pilha de telas com navegação hierárquica
    <Stack
      screenOptions={{
        // Por padrão, não mostra header (cada tela decide individualmente)
        headerShown: false,
      }}
    >
      {/* Tela inicial que decide para onde redirecionar */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }}
      />
      {/* Grupo de abas principais (cardápio, carrinho, pedidos, perfil) */}
      <Stack.Screen name="(tabs)" />
      {/* Tela de login */}
      <Stack.Screen name="(auth)/login" />
      {/* Tela de cadastro/registro */}
      <Stack.Screen name="(auth)/registro" />
      {/* Tela administrativa: gestão de produtos */}
      <Stack.Screen 
        name="admin/produtos"
        options={{
          headerShown: true,
          title: 'Gerenciar Produtos',
        }}
      />
      {/* Tela administrativa: gestão de categorias */}
      <Stack.Screen 
        name="admin/categorias"
        options={{
          headerShown: true,
          title: 'Gerenciar Categorias',
        }}
      />
      {/* Tela administrativa: visualizar todos os pedidos */}
      <Stack.Screen 
        name="admin/todos-pedidos"
        options={{
          headerShown: true,
          title: 'Todos os Pedidos',
        }}
      />
      {/* Tela administrativa: gestão de usuários */}
      <Stack.Screen 
        name="admin/usuarios"
        options={{
          headerShown: true,
          title: 'Gerenciar Usuários',
        }}
      />
      {/* Tela administrativa: gestão de mesas */}
      <Stack.Screen 
        name="admin/mesas"
        options={{
          headerShown: true,
          title: 'Gerenciar Mesas',
        }}
      />
      {/* Tela de QR Code para uma mesa específica (parâmetro [id]) */}
      <Stack.Screen 
        name="admin/mesas/[id]/qrcode"
        options={{
          headerShown: false,
        }}
      />
      {/* Tela para fechar conta de uma mesa específica */}
      <Stack.Screen 
        name="admin/mesas/[id]/fechar-conta"
        options={{
          headerShown: false,
        }}
      />
      {/* Tela de pagamento para uma mesa específica */}
      <Stack.Screen 
        name="admin/mesas/[id]/pagamento"
        options={{
          headerShown: false,
        }}
      />
      {/* Tela do cardápio acessada via QR Code (parâmetro [qrCode]) */}
      <Stack.Screen 
        name="mesa/[qrCode]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

// Componente raiz que envolve toda a aplicação com os providers necessários
export default function RootLayout() {
  return (
    // Provider de autenticação (gerencia login, logout, estado do usuário)
    <AuthProvider>
      {/* Provider do carrinho (gerencia produtos adicionados, quantidades, etc) */}
      <CarrinhoProvider>
        {/* Componente de navegação principal */}
        <RootLayoutNav />
      </CarrinhoProvider>
    </AuthProvider>
  );
}
