import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import useAlunosStore from '../store/useAlunosStore';
import AlunoForm from '../components/AlunoForm';
import { theme } from '@/styles/theme';
import { parseToISO } from '@/utils/dateUtils';

export default function ModalScreen() {
  const { addAluno } = useAlunosStore();
  const router = useRouter();

  const handleSubmit = async (data: { nome: string; telefone: string; dataNascimento: string; fotoUri: string | null }) => {
    try {
      const dataNascimentoISO = parseToISO(data.dataNascimento);
      await addAluno(data.nome, data.telefone, dataNascimentoISO, data.fotoUri || '');
      alert('Aluno salvo com sucesso!');
      router.back();
    } catch (e) {
      alert('Erro ao salvar aluno: ' + (e instanceof Error ? e.message : String(e)));
      console.error(e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          headerTitle: 'Novo Aluno',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontFamily: theme.fonts.title,
          },
        }}
      />
      <AlunoForm onSubmit={handleSubmit} submitLabel="Cadastrar" />
    </View>
  );
}


