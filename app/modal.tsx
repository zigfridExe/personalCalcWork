import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import * as FileSystem from 'expo-file-system';

import { Text, View } from '@/components/Themed';
import useAlunosStore from '../store/useAlunosStore';

export default function ModalScreen() {
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState('');
  const [contato, setContato] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const { addAluno } = useAlunosStore();
  const router = useRouter();

  const pickImage = async () => {
    console.log('Botão Selecionar Foto clicado');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      console.log('Foto selecionada:', selectedUri);
      setFotoUri(selectedUri);
    }
  };

  const handleSave = async () => {
    if (nome.trim().length > 0) {
      try {
        console.log('Salvando aluno:', { nome, status, contato, fotoUri });
        console.log('Tipo da fotoUri:', typeof fotoUri);
        console.log('FotoUri é null/undefined?', fotoUri === null || fotoUri === undefined);
        
        await addAluno(nome, status, contato, fotoUri || '');
        alert('Aluno salvo com sucesso!');
        router.back();
      } catch (e) {
        alert('Erro ao salvar aluno: ' + (e instanceof Error ? e.message : String(e)));
        console.error(e);
      }
    } else {
      alert('Por favor, insira o nome do aluno.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Aluno</Text>
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
      <Button title="Selecionar Foto" onPress={pickImage} />
      {fotoUri && <Image source={{ uri: fotoUri }} style={styles.imagePreview} />}
      <Button title="Salvar" onPress={handleSave} />

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
