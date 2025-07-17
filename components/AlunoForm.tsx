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

export default function AlunoForm({ initialValues, onSubmit, submitLabel = 'Salvar' }: AlunoFormProps) {
  const [nome, setNome] = useState(initialValues?.nome || '');
  const [telefone, setTelefone] = useState(initialValues?.telefone || '');
  const [dataNascimento, setDataNascimento] = useState(initialValues?.dataNascimento || '');
  const [fotoUri, setFotoUri] = useState<string | null>(initialValues?.fotoUri || null);

  useEffect(() => {
    if (initialValues) {
      setNome(initialValues.nome || '');
      setTelefone(initialValues.telefone || '');
      setDataNascimento(initialValues.dataNascimento || '');
      setFotoUri(initialValues.fotoUri || null);
    }
  }, [initialValues]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setFotoUri(null);
  };

  // Função para aplicar máscara de data DD/MM/AAAA
  function maskDate(value: string) {
    // Remove tudo que não for número
    let v = value.replace(/\D/g, '');
    // Limita a 8 dígitos
    v = v.slice(0, 8);
    // Adiciona as barras
    if (v.length > 4) {
      v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
    return v;
  }

  // Função para validar data no formato DD/MM/AAAA
  function isDataValidaBR(data: string) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
    const [d, m, y] = data.split('/');
    const date = new Date(`${y}-${m}-${d}`);
    return !isNaN(date.getTime()) && Number(d) > 0 && Number(m) > 0 && Number(m) <= 12 && Number(y) > 1900;
  }

  // Função para aplicar máscara de telefone
  function maskPhone(value: string) {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      // Celular: (XX) XXXXX-XXXX
      return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else if (v.length > 2) {
      // Fixo: (XX) XXXX-XXXX
      return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      return v;
    }
  }

  // Função para validar telefone
  function isTelefoneValido(telefone: string) {
    const v = telefone.replace(/\D/g, '');
    return v.length === 10 || v.length === 11;
  }

  const handleSubmit = () => {
    if (!nome.trim() || !telefone.trim() || !dataNascimento.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!isDataValidaBR(dataNascimento)) {
      alert('Data de nascimento inválida! Use o formato DD/MM/AAAA.');
      return;
    }
    if (!isTelefoneValido(telefone)) {
      alert('Telefone inválido! Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.');
      return;
    }
    // Salvar só os números no banco
    const telefoneNumeros = telefone.replace(/\D/g, '');
    onSubmit({ nome, telefone: telefoneNumeros, dataNascimento, fotoUri });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados do Aluno</Text>
      <View style={styles.imageContainer}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>{nome.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.photoButtons}>
        <Button title="📷 Selecionar Foto" onPress={pickImage} color="#2196F3" />
        {fotoUri && <Button title="🗑️ Remover Foto" onPress={handleRemovePhoto} color="#f44336" />}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nome do Aluno"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={maskPhone(telefone)}
        onChangeText={text => setTelefone(maskPhone(text))}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Nascimento (DD/MM/AAAA)"
        value={dataNascimento}
        onChangeText={text => setDataNascimento(maskDate(text))}
        keyboardType="number-pad"
      />
      <Button title={submitLabel} onPress={handleSubmit} />
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