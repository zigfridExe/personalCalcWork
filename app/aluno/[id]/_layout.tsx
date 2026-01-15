import { Stack } from 'expo-router';
import { stackNavigationOptions } from '@/styles/navigation.styles';

export default function AlunoIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        ...stackNavigationOptions,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Detalhes do Aluno',
        }}
      />
      <Stack.Screen
        name="avaliacao"
        options={{
          title: 'Avaliação Física',
        }}
      />
      <Stack.Screen
        name="fichas"
        options={{
          title: 'Fichas do Aluno',
        }}
      />
      <Stack.Screen
        name="horarios"
        options={{
          title: 'Horários',
        }}
      />
      <Stack.Screen
        name="horarios-padrao"
        options={{
          title: 'Horários Padrão',
        }}
      />
      <Stack.Screen
        name="imc"
        options={{
          title: 'IMC',
        }}
      />
      <Stack.Screen
        name="nova-medida"
        options={{
          title: 'Nova Medida',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
