import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import useAlunosStore from '../../store/useAlunosStore';

interface Aluno {
  id: number;
  nome: string;
  status?: string;
  contato?: string;
  fotoUri?: string;
  lembrete_hidratacao_minutos?: number | null;
}

export default function EditAlunoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { alunos, updateAluno } = useAlunosStore();
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState('');
  const [contato, setContato] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [lembreteHidratacao, setLembreteHidratacao] = useState<string>('');

  useEffect(() => {
    const aluno = (alunos as Aluno[]).find((a) => a.id.toString() === id);
    console.log('Carregando dados do aluno:', aluno);
    if (aluno) {
      setNome(aluno.nome);
      setStatus(aluno.status || '');
      setContato(aluno.contato || '');
      setFotoUri(aluno.fotoUri || null);
      setLembreteHidratacao(aluno.lembrete_hidratacao_minutos ? String(aluno.lembrete_hidratacao_minutos) : '');
      console.log('Dados do aluno carregados:', {
        nome: aluno.nome,
        status: aluno.status,
        contato: aluno.contato,
        fotoUri: aluno.fotoUri
      });
    }
  }, [id, alunos]);

  const pickImage = async () => {
    console.log('Botão Alterar Foto clicado');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      console.log('Nova foto selecionada:', selectedUri);
      setFotoUri(selectedUri);
    }
  };

  const handleSave = async () => {
    if (nome.trim().length > 0) {
      try {
        console.log('Salvando alterações do aluno:', { id, nome, status, contato, fotoUri });
        console.log('Tipo da fotoUri:', typeof fotoUri);
        console.log('FotoUri é null/undefined?', fotoUri === null || fotoUri === undefined);
        
        await updateAluno(Number(id), nome, status, contato, fotoUri || '', lembreteHidratacao ? Number(lembreteHidratacao) : null);
        alert('Aluno atualizado com sucesso!');
        router.back();
      } catch (e) {
        alert('Erro ao atualizar aluno: ' + (e instanceof Error ? e.message : String(e)));
        console.error(e);
      }
    } else {
      alert('Por favor, insira o nome do aluno.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Aluno</Text>
      
      {/* Preview da foto */}
      <View style={styles.imageContainer}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {nome.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.photoButtons}>
        <Button title="📷 Alterar Foto" onPress={pickImage} color="#2196F3" />
        {fotoUri && (
          <Button title="🗑️ Remover Foto" onPress={() => setFotoUri(null)} color="#f44336" />
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nome do Aluno"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Status (Ex: Ativo, Inativo)"
        value={status}
        onChangeText={setStatus}
      />
      <TextInput
        style={styles.input}
        placeholder="Contato (Ex: Telefone, Email)"
        value={contato}
        onChangeText={setContato}
      />
      <TextInput
        style={styles.input}
        placeholder="Lembrete de hidratação (minutos)"
        value={lembreteHidratacao}
        onChangeText={setLembreteHidratacao}
        keyboardType="numeric"
      />
      <Button title="Salvar Alterações" onPress={handleSave} />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  imagePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#666',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
});
