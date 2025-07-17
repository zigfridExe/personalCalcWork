import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import useAlunosStore from '../../store/useAlunosStore';
// Corrigido o caminho do AlunoForm para refletir a estrutura correta do projeto
import AlunoForm from '../../components/AlunoForm';

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

  const aluno = (alunos as any[]).find((a) => a.id.toString() === id);

  const initialValues = {
    nome: aluno?.nome || '',
    telefone: aluno?.contato || '',
    dataNascimento: aluno?.data_nascimento || '',
    fotoUri: aluno?.fotoUri || null,
  };

  // Função para aplicar máscara de telefone
  function maskPhone(value: string) {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else if (v.length > 2) {
      return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      return v;
    }
  }
  function isTelefoneValido(telefone: string) {
    const v = telefone.replace(/\D/g, '');
    return v.length === 10 || v.length === 11;
  }

  const handleSubmit = async (data: { nome: string; telefone: string; dataNascimento: string; fotoUri: string | null }) => {
    if (!isTelefoneValido(data.telefone)) {
      alert('Telefone inválido! Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.');
      return;
    }
    const telefoneNumeros = data.telefone.replace(/\D/g, '');
    try {
      await updateAluno(Number(id), data.nome, telefoneNumeros, data.dataNascimento, data.fotoUri || '');
      alert('Aluno atualizado com sucesso!');
      router.back();
    } catch (e) {
      alert('Erro ao atualizar aluno: ' + (e instanceof Error ? e.message : String(e)));
      console.error(e);
    }
  };

  if (!aluno) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Aluno não encontrado.</Text></View>;
  }

  return (
    <AlunoForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Salvar Alterações" />
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
