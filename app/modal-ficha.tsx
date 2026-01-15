import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from 'react-native';
import useFichasStore from '../store/useFichasStore';
import { theme } from '@/styles/theme';

export default function ModalFichaScreen() {
  const router = useRouter();
  const { alunoId, fichaId } = useLocalSearchParams();
  const { fichas, addFicha, updateFicha } = useFichasStore();

  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [professor, setProfessor] = useState('');
  const [descansoPadrao, setDescansoPadrao] = useState('');

  const isEditing = !!fichaId;

  useEffect(() => {
    if (isEditing) {
      const fichaToEdit = fichas.find((f) => f.id.toString() === fichaId);
      if (fichaToEdit) {
        setNome(fichaToEdit.nome || '');
        setDataInicio(fichaToEdit.data_inicio || '');
        setDataFim(fichaToEdit.data_fim || '');
        setObjetivos(fichaToEdit.objetivos || '');
        setObservacoes(fichaToEdit.observacoes || '');
        setProfessor(fichaToEdit.professor || '');
        setDescansoPadrao(fichaToEdit.descanso_padrao || '');
      }
    }
  }, [isEditing, fichaId, fichas]);

  const handleSave = async () => {
    if (nome.trim().length === 0) {
      Alert.alert('Erro', 'Por favor, insira o nome da ficha.');
      return;
    }

    const fichaData = {
      aluno_id: Number(alunoId),
      nome,
      data_inicio: dataInicio,
      data_fim: dataFim,
      objetivos,
      observacoes,
      professor,
      descanso_padrao: descansoPadrao,
    };

    if (isEditing) {
      await updateFicha({ ...fichaData, id: Number(fichaId) });
    } else {
      await addFicha(fichaData);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditing ? 'Editar Ficha' : 'Nova Ficha'}</Text>

        <Text style={styles.label}>Nome da Ficha</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Treino A - Hipertrofia"
          placeholderTextColor={theme.colors.textSecondary}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Data Início (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={theme.colors.textSecondary}
          value={dataInicio}
          onChangeText={setDataInicio}
        />

        <Text style={styles.label}>Data Fim (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={theme.colors.textSecondary}
          value={dataFim}
          onChangeText={setDataFim}
        />

        <Text style={styles.label}>Objetivos</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: Ganho de massa, perda de peso..."
          placeholderTextColor={theme.colors.textSecondary}
          value={objetivos}
          onChangeText={setObjetivos}
          multiline
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: Cuidado com o joelho..."
          placeholderTextColor={theme.colors.textSecondary}
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
        />

        <Text style={styles.label}>Professor</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do professor"
          placeholderTextColor={theme.colors.textSecondary}
          value={professor}
          onChangeText={setProfessor}
        />

        <Text style={styles.label}>Descanso Padrão</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 40s"
          placeholderTextColor={theme.colors.textSecondary}
          value={descansoPadrao}
          onChangeText={setDescansoPadrao}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>SALVAR FICHA</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.fonts.regular,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: theme.fonts.regular,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  saveButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    fontSize: 18,
    textTransform: 'uppercase',
  },
});
