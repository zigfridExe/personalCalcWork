// Arquivo central de estilos de navegação
// Utilize stackNavigationOptions para Stack, tabNavigationOptions para Tabs e navigationStyles para componentes visuais.


import { StyleSheet } from 'react-native';
import { theme } from './theme';

// Opções globais para navegação tipo Stack (telas internas)
export const stackNavigationOptions = {
  contentStyle: { backgroundColor: theme.colors.background },
  headerStyle: { backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border, elevation: 0, shadowOpacity: 0 },
  headerTintColor: theme.colors.text,
  headerTitleStyle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.title, // Usando a nova fonte
  },
  headerTitleAlign: 'center' as const,
};

// Opções globais para navegação tipo TabBar (abas inferiores)
export const tabNavigationOptions = {
  tabBarStyle: { backgroundColor: theme.colors.background, borderTopWidth: 0, elevation: 10, height: 60, paddingBottom: 5, paddingTop: 5 },
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textSecondary,
  tabBarLabelStyle: { fontSize: 12, fontFamily: theme.fonts.secondary, marginBottom: 5 },
  tabBarHideOnKeyboard: true,
};

// Estilos visuais para uso em componentes (View, Text, etc)
export const navigationStyles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

/*
Exemplo de uso:

// Para Stack.Screen
<Stack.Screen name="modal" options={{ ...stackNavigationOptions }} />

// Para Tabs.Screen
<Tabs.Screen name="Dashboard" options={tabNavigationOptions} />
*/
