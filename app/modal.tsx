import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import useAlunosStore from '../store/useAlunosStore';
import AlunoForm from '../components/AlunoForm';

export default function ModalScreen() {
  const { addAluno } = useAlunosStore();
  const router = useRouter();

  const handleSubmit = async (data: { nome: string; telefone: string; dataNascimento: string; fotoUri: string | null }) => {
    try {
      await addAluno(data.nome, data.telefone, data.dataNascimento, data.fotoUri || '');
      alert('Aluno salvo com sucesso!');
      router.back();
    } catch (e) {
      alert('Erro ao salvar aluno: ' + (e instanceof Error ? e.message : String(e)));
      console.error(e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Stack.Screen
        options={{
          headerTitle: 'Novo Aluno',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AlunoForm onSubmit={handleSubmit} submitLabel="Cadastrar" />
    </View>
  );
}


