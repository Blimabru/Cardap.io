/**
 * Layout de Tabs (Navegação Principal)
 * 
 * Configura as tabs principais do app
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useCarrinho } from '../../contexts/CarrinhoContext';

export default function TabLayout() {
  const { autenticado, podeGerenciar, ehAdmin, ehDono, ehCliente } = useAuth();
  const { quantidadeTotal } = useCarrinho();

  // Log de debug para verificar permissões
  console.log('🔍 TabLayout - podeGerenciar:', podeGerenciar);
  console.log('🔍 TabLayout - ehAdmin:', ehAdmin);
  console.log('🔍 TabLayout - ehDono:', ehDono);
  console.log('🔍 TabLayout - ehCliente:', ehCliente);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FFF',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#333',
        },
      }}
    >
      {/* ============================================================ */}
      {/* TABS VISÍVEIS PARA TODOS OS USUÁRIOS                         */}
      {/* ============================================================ */}

      {/* Tab 1: Cardápio (todos podem ver) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cardápio',
          headerTitle: 'Cardap.io',
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
          headerTitle: 'Meu Carrinho',
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
          headerTitle: 'Meus Pedidos',
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
          headerTitle: 'Meu Perfil',
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
          headerTitle: 'Administração',
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
