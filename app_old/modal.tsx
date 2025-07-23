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


import { CARD, INPUT, AVATAR, FONT, SPACING } from '../styles/AppStyles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.padding.card,
    backgroundColor: CARD.backgroundColor,
  },
  title: {
    fontSize: FONT.sizes.h2,
    fontWeight: 'bold',
    marginBottom: SPACING.margin.card,
    color: '#212121',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: INPUT.borderColor,
    borderWidth: 1,
    marginBottom: SPACING.gap.medium,
    paddingHorizontal: INPUT.padding,
    borderRadius: INPUT.borderRadius,
    backgroundColor: INPUT.backgroundColor,
  },
  imagePreview: {
    width: AVATAR.size,
    height: AVATAR.size,
    borderRadius: AVATAR.borderRadius,
    marginTop: SPACING.gap.small,
    marginBottom: SPACING.gap.medium,
  },
});
