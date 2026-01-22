import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
// Corrigido o caminho do AlunoForm para refletir a estrutura correta do projeto
import AlunoForm from '../../components/AlunoForm';
import { theme } from '@/styles/theme';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { parseToISO } from '@/utils/dateUtils';

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
      const dataNascimentoISO = parseToISO(data.dataNascimento);
      await updateAluno(Number(id), data.nome, telefoneNumeros, dataNascimentoISO, data.fotoUri || '');
      alert('Aluno atualizado com sucesso!');
      router.back();
    } catch (e) {
      alert('Erro ao atualizar aluno: ' + (e instanceof Error ? e.message : String(e)));
      console.error(e);
    }
  };

  if (!aluno) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Aluno não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Editar Aluno" />
      <AlunoForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Salvar Alterações" />
    </View>
  );
}
