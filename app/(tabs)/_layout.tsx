/**
 * Layout de Tabs (Navegação Principal por Abas)
 * 
 * Este componente configura a navegação principal do app através de tabs (abas)
 * na parte inferior da tela. Cada tab representa uma seção principal:
 * - Cardápio (home)
 * - Carrinho
 * - Pedidos  
 * - Perfil
 * - Admin (só para administradores)
 */

import React from 'react';
// Componente de navegação por tabs do Expo Router
import { Tabs } from 'expo-router';
// Ícones do Material Design
import { MaterialIcons } from '@expo/vector-icons';
// Componentes básicos do React Native
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
// Contextos para gerenciar estado de autenticação e carrinho
import { useAuth } from '../../contexts/AuthContext';
import { useCarrinho } from '../../contexts/CarrinhoContext';

export default function TabLayout() {
  // Dimensões da tela para responsividade
  const { width: screenWidth } = useWindowDimensions();
  
  // Obtém dados de autenticação e permissões do usuário
  const { autenticado, podeGerenciar, ehAdmin, ehDono, ehCliente } = useAuth();
  // Obtém quantidade total de itens no carrinho (para badge)
  const { quantidadeTotal } = useCarrinho();

  // Logs de debug para verificar permissões durante desenvolvimento
  console.log('🔍 TabLayout - podeGerenciar:', podeGerenciar);
  console.log('🔍 TabLayout - ehAdmin:', ehAdmin);
  console.log('🔍 TabLayout - ehDono:', ehDono);
  console.log('🔍 TabLayout - ehCliente:', ehCliente);
  
  return (
    // Componente Tabs que cria navegação por abas na parte inferior
    <Tabs
      screenOptions={{
        // Cor dos ícones/texto quando tab está ativa
        tabBarActiveTintColor: '#ffffffff',
        // Cor dos ícones/texto quando tab está inativa
        tabBarInactiveTintColor: '#000000ff',
        // Estilo da barra de tabs - totalmente responsivo
        tabBarStyle: {
          height: 85, // Altura maior da barra de tabs para evitar cortes
          paddingBottom: Platform.OS === 'ios' ? 25 : 12, // Espaçamento inferior maior no iOS (safe area), menor no Android
          paddingTop: 10, // Espaçamento superior
          paddingHorizontal: 0, // Sem padding horizontal para usar toda largura
          width: '100%', // Sempre responsivo
          maxWidth: '100%', // Sempre responsivo
          overflow: 'hidden', // Prevenir cortes
          backgroundColor: '#E95322',
        },
        // Estilo do texto dos labels das tabs
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2, // Espaçamento entre ícone e texto
        },
        // Estilo dos ícones das tabs
        tabBarIconStyle: {
          marginTop: 4, // Espaçamento superior do ícone
        },
        // Esconder header padrão - usando HomeHeader customizado
        headerShown: false,
      }}
    >
      {/* ============================================================ */}
      {/* TABS VISÍVEIS PARA TODOS OS USUÁRIOS (LOGADOS OU NÃO)       */}
      {/* ============================================================ */}

      {/* Tab 1: Cardápio (todos podem ver) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cardápio',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="restaurant-menu" size={28} color={color} />
          ),
        }}
      />
      
      {/* Tab 2: Carrinho (todos podem ver) */}
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color }) => (
            <View>
              <MaterialIcons name="shopping-cart" size={28} color={color} />
              {quantidadeTotal > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{quantidadeTotal}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* Tab 3: Pedidos (requer login) */}
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={28} color={color} />
          ),
          // Tab sempre visível, mas conteúdo mostra mensagem se não logado
        }}
      />

      {/* Tab 4: Perfil (requer login) */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={28} color={color} />
          ),
          // Tab sempre visível, mas conteúdo mostra mensagem se não logado
        }}
      />

      {/* ============================================================ */}
      {/* TAB ADMIN - CONDICIONAL COM HREF                             */}
      {/* ============================================================ */}
      {/* 
        REGRA: Apenas Admin e Dono podem ver a tab Admin
        
        TÉCNICA: Usar href: null para OCULTAR completamente a tab
        
        SE podeGerenciar = true (Admin OU Dono):
          → href = undefined → Tab Admin APARECE ✅
        
        SE podeGerenciar = false (Cliente):
          → href = null → Tab Admin NÃO APARECE ❌
      */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          // CHAVE: href: null REMOVE a tab completamente da navegação
          // Se podeGerenciar = false → href: null → tab invisível
          // Se podeGerenciar = true → href: undefined → tab visível
          href: podeGerenciar ? undefined : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="admin-panel-settings" size={28} color={color} />
          ),
        }}
      />

      {/* Tab explore (oculta - não implementada) */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Esconde esta tab (não implementada ainda)
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
