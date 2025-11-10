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
  const { podeGerenciar } = useAuth();
  const { quantidadeTotal } = useCarrinho();

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

      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          headerTitle: 'Meus Pedidos',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={28} color={color} />
          ),
        }}
      />

      {podeGerenciar && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            headerTitle: 'Administração',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="admin-panel-settings" size={28} color={color} />
            ),
          }}
        />
      )}

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
