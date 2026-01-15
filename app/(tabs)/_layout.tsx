import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme, View, StyleSheet, Text } from 'react-native';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { navigationStyles, tabNavigationOptions } from '@/styles/navigation.styles';

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


export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';

  // Configurações comuns para as telas
  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarStyle: tabNavigationOptions.tabBarStyle,
    tabBarActiveTintColor: tabNavigationOptions.tabBarActiveTintColor,
    tabBarInactiveTintColor: tabNavigationOptions.tabBarInactiveTintColor,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600' as const,
      marginBottom: 5,
    },
    tabBarHideOnKeyboard: true,
    tabBarLabel: ({ focused, color, children }) => {
      const LabelText = Text as any; // Workaround temporário
      return (
        <LabelText
          style={{
            color,
            opacity: focused ? 1 : 0.7,
            transform: [{ scale: focused ? 1 : 0.95 }],
            fontSize: 12,
            fontWeight: '600' as const,
            marginBottom: 5,
            textAlign: 'center',
          }}
        >
          {children}
        </LabelText>
      );
    },
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
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
