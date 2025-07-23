import { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAlunosStore from '../store/useAlunosStore';
import AlunoForm from '../components/AlunoForm';

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
      alert('Erro ao atualizar aluno.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AlunoForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        maskPhone={maskPhone}
      />
    </View>
  );
}
