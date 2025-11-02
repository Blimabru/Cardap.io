import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Cardap.io', 
          headerShown: true, 
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#007AFF',
          },
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="restaurant-menu" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore" 
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="search" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}