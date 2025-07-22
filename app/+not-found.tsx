import { Link, Stack } from 'expo-router';
import { Text, View } from '@/components/Themed';
import notFoundStyles from '../styles/notFoundStyles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={notFoundStyles.container}>
        <Text style={notFoundStyles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={notFoundStyles.link}>
          <Text style={notFoundStyles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

