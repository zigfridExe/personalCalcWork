import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

// Cores padronizadas (pode importar de um arquivo de tema futuramente)
const Colors = {
  dark: {
    background: '#232323',
    tabIconDefault: '#888888',
    tabIconSelected: '#FFB800',
    text: '#FFFFFF',
    tint: '#FFB800',
  },
  light: {
    background: '#232323',
    tabIconDefault: '#888888',
    tabIconSelected: '#FFB800',
    text: '#FFFFFF',
    tint: '#FFB800',
  },
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  // Por padrão, vamos usar o tema light
  const colorScheme = 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="alunos"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="users" color={focused ? colors.tabIconSelected : colors.tabIconDefault} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="calendar" color={focused ? colors.tabIconSelected : colors.tabIconDefault} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="cog" color={focused ? colors.tabIconSelected : colors.tabIconDefault} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="home" color={focused ? colors.tabIconSelected : colors.tabIconDefault} />
          ),
        }}
      />
    </Tabs>
  );
}
