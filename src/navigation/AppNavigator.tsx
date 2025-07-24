import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Import das telas
import AlunosScreen from '../domains/aluno/screens/AlunosScreen';
import EditAlunoScreen from '../domains/aluno/screens/EditAlunoScreen';
// Importe outras telas conforme necessário

// Cores
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

// Tipos de navegação
type RootStackParamList = {
  MainTabs: undefined;
  EditAluno: { id: number };
  // Adicione outras rotas aqui
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Componente de ícone para as abas
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

// Navegação por abas
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.dark.background,
          borderTopWidth: 0,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: Colors.dark.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: Colors.dark.text,
      }}>
      <Tab.Screen
        name="Alunos"
        component={AlunosScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="users" color={color} />
          ),
        }}
      />
      {/* Adicione outras abas aqui */}
    </Tab.Navigator>
  );
}

// Navegação principal
export default function AppNavigator() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#FFB800',
      background: '#232323',
      card: '#232323',
      text: '#FFFFFF',
      border: 'transparent',
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#232323',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#232323',
          },
        }}>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="EditAluno" 
          component={EditAlunoScreen}
          options={{ title: 'Editar Aluno' }}
        />
        {/* Adicione outras telas de navegação em pilha aqui */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
