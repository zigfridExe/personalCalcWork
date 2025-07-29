import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/styles/Themed';
import useFichasStore from '../store/useFichasStore';

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
      alert('Por favor, insira o nome da ficha.');
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
        <Text style={styles.title}>{isEditing ? 'Editar Ficha de Treino' : 'Nova Ficha de Treino'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da Ficha (Ex: Treino A)"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Data Início (AAAA-MM-DD)"
          value={dataInicio}
          onChangeText={setDataInicio}
        />
        <TextInput
          style={styles.input}
          placeholder="Data Fim (AAAA-MM-DD)"
          value={dataFim}
          onChangeText={setDataFim}
        />
        <TextInput
          style={styles.input}
          placeholder="Objetivos"
          value={objetivos}
          onChangeText={setObjetivos}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Observações"
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Professor"
          value={professor}
          onChangeText={setProfessor}
        />
        <TextInput
          style={styles.input}
          placeholder="Descanso Padrão (Ex: 40s)"
          value={descansoPadrao}
          onChangeText={setDescansoPadrao}
        />
        <Button title="Salvar Ficha" onPress={handleSave} />
      </ScrollView>

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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
