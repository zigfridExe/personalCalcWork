// Arquivo central de estilos de navegação
// Utilize navigationStyles.stack para Stack, navigationStyles.tabBar para Tabs, etc.

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
  headerTitleStyle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
};

// Opções globais para navegação tipo Tabs (menu inferior)
export const tabNavigationOptions = {
  tabBarStyle: { backgroundColor: COLORS.background, borderTopWidth: 0, elevation: 10, height: 60, paddingBottom: 5, paddingTop: 5 },
  tabBarActiveTintColor: COLORS.active,
  tabBarInactiveTintColor: COLORS.inactive,
  tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 5 },
  // tabBarLabel: TabBarLabel, // Descomente se usar label customizada
  tabBarHideOnKeyboard: true,
};

// Apenas para uso em componentes visuais (View, Text, etc)


export const navigationStyles = StyleSheet.create({
  // Estilo visual para ícones das tabs
  tabBarIcon: {
    marginBottom: -3,
  },
  // Exemplo de container visual, se precisar em componentes:
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.content,
  },
});

// Exporte as opções padronizadas para uso direto nos layouts
export default navigationStyles;
