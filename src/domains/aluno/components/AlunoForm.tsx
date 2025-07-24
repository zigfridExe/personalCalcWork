import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

interface AlunoFormProps {
  initialValues?: {
    nome: string;
    telefone: string;
    dataNascimento: string;
    fotoUri?: string | null;
  };
  onSubmit: (data: { nome: string; telefone: string; dataNascimento: string; fotoUri: string | null }) => void;
  submitLabel?: string;
}

export function AlunoForm({ initialValues, onSubmit, submitLabel = 'Salvar' }: AlunoFormProps) {
  const [nome, setNome] = useState(initialValues?.nome || '');
  const [telefone, setTelefone] = useState(initialValues?.telefone || '');
  const [dataNascimento, setDataNascimento] = useState(initialValues?.dataNascimento || '');
  const [fotoUri, setFotoUri] = useState<string | null>(initialValues?.fotoUri || null);

  const handleSubmit = () => {
    onSubmit({
      nome,
      telefone,
      dataNascimento,
      fotoUri
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Desculpe, precisamos de permissão para acessar a galeria!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setFotoUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {fotoUri && (
        <Image source={{ uri: fotoUri }} style={styles.foto} />
      )}
      
      <Button title="Selecionar Foto" onPress={pickImage} />
      
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Data de Nascimento"
        value={dataNascimento}
        onChangeText={setDataNascimento}
      />
      
      <Button title={submitLabel} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  foto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
