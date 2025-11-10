/**
 * Layout Raiz da Aplicação
 * 
 * Configura providers globais e navegação
 */

import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { CarrinhoProvider } from '../contexts/CarrinhoContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="(auth)/login" 
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="(auth)/registro"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </CarrinhoProvider>
    </AuthProvider>
  );
}
