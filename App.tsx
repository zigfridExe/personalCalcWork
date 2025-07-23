import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardTempScreen from './src/screens/DashboardTempScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator initialRouteName="DashboardTemp">
        <Stack.Screen
          name="DashboardTemp"
          component={DashboardTempScreen}
          options={{ title: 'Dashboard' }}
        />
        {/* Adicione outras telas aqui conforme for migrando */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
