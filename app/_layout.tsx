import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/styles/useColorScheme';
import AppLayout from '../components/layout/AppLayout';
import { navigationStyles } from '@/styles/navigation.styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AppLayout>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: navigationStyles.header,
          headerTitleStyle: navigationStyles.headerTitle,
          headerTintColor: '#FFFFFF',
          headerTitleAlign: 'center',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false, // Mantém as tabs sem header se necessário
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            headerStyle: navigationStyles.header,
            headerTitleStyle: navigationStyles.headerTitle,
            headerTintColor: '#FFFFFF',
            headerTitleAlign: 'center',
          }} 
        />
      </Stack>
    </AppLayout>
  );
}
