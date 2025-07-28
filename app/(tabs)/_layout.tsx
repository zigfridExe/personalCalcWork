import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme, View, Text, StyleSheet } from 'react-native';
import { navigationStyles, tabBarOptions } from '@/styles/navigation.styles';

// Componente para o ícone da barra de navegação
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={navigationStyles.tabBarIcon}>
      <FontAwesome 
        size={24} 
        name={props.name} 
        color={props.color} 
        style={{
          opacity: props.focused ? 1 : 0.7,
          transform: [{ scale: props.focused ? 1.1 : 1 }]
        }} 
      />
    </View>
  );
}

// Componente para o texto da aba
const TabBarLabel = ({ focused, color, children }: { focused: boolean; color: string; children: string }) => (
  <Text 
    style={[
      navigationStyles.tabBarLabel, 
      { 
        color, 
        opacity: focused ? 1 : 0.7,
        transform: [{ scale: focused ? 1 : 0.95 }]
      }
    ]}
  >
    {children}
  </Text>
);

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';

  // Configurações comuns para as telas
  const screenOptions = {
    headerStyle: navigationStyles.header,
    headerTitleStyle: navigationStyles.headerTitle,
    headerTintColor: '#FFFFFF',
    headerTitleAlign: 'center' as const,
    tabBarStyle: navigationStyles.tabBar,
    tabBarActiveTintColor: tabBarOptions.activeTintColor,
    tabBarInactiveTintColor: tabBarOptions.inactiveTintColor,
    tabBarLabel: TabBarLabel,
    tabBarHideOnKeyboard: true,
  };

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="alunos"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="users" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="cog" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
