import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { MediaType } from 'expo-image-picker';

import * as FileSystem from 'expo-file-system';
import useAlunosStore from '../../store/useAlunosStore';

export default function EditAlunoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { alunos, updateAluno } = useAlunosStore();
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState('');
  const [contato, setContato] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  useEffect(() => {
    const aluno = alunos.find((a) => a.id.toString() === id);
    if (aluno) {
      setNome(aluno.nome);
      setStatus(aluno.status || '');
      setContato(aluno.contato || '');
      setFotoUri(aluno.fotoUri || null);
    }
  }, [id, alunos]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      const fileName = newUri.split('/').pop();
      const newPath = FileSystem.documentDirectory + 'photos/' + fileName;

      try {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos/', { intermediates: true });
        await FileSystem.copyAsync({ from: newUri, to: newPath });
        setFotoUri(newPath);
      } catch (e) {
        console.error('Erro ao copiar imagem:', e);
        alert('Erro ao salvar a imagem.');
      }
    }
  };

  const handleSave = async () => {
    if (nome.trim().length > 0) {
      await updateAluno(Number(id), nome, status, contato, fotoUri || undefined);
      router.back();
    } else {
      alert('Por favor, insira o nome do aluno.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Aluno</Text>
      {fotoUri && <Image source={{ uri: fotoUri }} style={styles.imagePreview} />}
      <Button title="Alterar Foto" onPress={pickImage} />
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
});
