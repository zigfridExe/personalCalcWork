import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import * as FileSystem from 'expo-file-system';

import { Text, View } from '@/components/Themed';
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
    <AlunoForm onSubmit={handleSubmit} submitLabel="Cadastrar" />
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
