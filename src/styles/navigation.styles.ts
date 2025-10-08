// Arquivo central de estilos de navegação
// Utilize stackNavigationOptions para Stack, tabNavigationOptions para Tabs e navigationStyles para componentes visuais.

import { StyleSheet } from 'react-native';

// Paleta de cores centralizada (altere aqui para refletir em todo app)
const COLORS = {
  background: '#000000', // Fundo preto
  content: '#1A1A1A',   // Fundo cinza escuro
  header: '#111111',    // Header preto
  text: '#FFFFFF',      // Texto branco
  active: '#FFB700',    // Amarelo destaque
  inactive: '#888888',  // Cinza inativo
  border: '#333333',    // Borda sutil
};

// Opções globais para navegação tipo Stack (telas internas)
export const stackNavigationOptions = {
  contentStyle: { backgroundColor: COLORS.content },
  headerStyle: { backgroundColor: COLORS.header, borderBottomWidth: 1, borderBottomColor: COLORS.border, elevation: 0, shadowOpacity: 0 },
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    color: '#FFFFFF', // valor literal para máxima compatibilidade
    fontSize: 18,
    fontWeight: 'bold' as const, // Using 'bold' which is a valid string literal type
  },
  headerTitleAlign: 'center' as const,
};

// Opções globais para navegação tipo TabBar (abas inferiores)
export const tabNavigationOptions = {
  tabBarStyle: { backgroundColor: COLORS.background, borderTopWidth: 0, elevation: 10, height: 60, paddingBottom: 5, paddingTop: 5 },
  tabBarActiveTintColor: COLORS.active,
  tabBarInactiveTintColor: COLORS.inactive,
  tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 5 },
  tabBarHideOnKeyboard: true,
};

// Estilos visuais para uso em componentes (View, Text, etc)
export const navigationStyles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.content,
  },
});

/*
Exemplo de uso:

// Para Stack.Screen
<Stack.Screen name="modal" options={{ ...stackNavigationOptions }} />

// Para Tabs.Screen
<Tabs.Screen name="Dashboard" options={tabNavigationOptions} />
*/
