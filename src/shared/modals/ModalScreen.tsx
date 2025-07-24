import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, Image } from 'react-native';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { View, Text } from 'react-native';
import useAlunosStore from '../store/useAlunosStore';
import { AlunoForm } from '../../domains/aluno/components/AlunoForm';

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
    // ...
  },
});
