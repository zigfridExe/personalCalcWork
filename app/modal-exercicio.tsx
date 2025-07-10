import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/Themed';
import useExerciciosStore from '../store/useExerciciosStore';

export default function ModalExercicioScreen() {
  const router = useRouter();
  const { fichaId, exercicioId } = useLocalSearchParams();
  const { exercicios, addExercicio, updateExercicio } = useExerciciosStore();

  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [maquina, setMaquina] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [carga, setCarga] = useState('');
  const [ajuste, setAjuste] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const isEditing = !!exercicioId;

  useEffect(() => {
    if (isEditing) {
      const exercicioToEdit = exercicios.find((e) => e.id.toString() === exercicioId);
      if (exercicioToEdit) {
        setNome(exercicioToEdit.nome || '');
        setGrupoMuscular(exercicioToEdit.grupo_muscular || '');
        setMaquina(exercicioToEdit.maquina || '');
        setSeries(exercicioToEdit.series || '');
        setRepeticoes(exercicioToEdit.repeticoes || '');
        setCarga(exercicioToEdit.carga || '');
        setAjuste(exercicioToEdit.ajuste || '');
        setObservacoes(exercicioToEdit.observacoes || '');
      }
    }
  }, [isEditing, exercicioId, exercicios]);

  const handleSave = async () => {
    if (nome.trim().length === 0) {
      alert('Por favor, insira o nome do exercício.');
      return;
    }

    const exercicioData = {
      ficha_id: Number(fichaId),
      nome,
      grupo_muscular: grupoMuscular,
      maquina,
      series,
      repeticoes,
      carga,
      ajuste,
      observacoes,
    };

    if (isEditing) {
      await updateExercicio({ ...exercicioData, id: Number(exercicioId) });
    } else {
      await addExercicio(exercicioData);
    }
    router.back();
  };

  const gruposMusculares = [
    'Costas',
    'Peitoral',
    'Membros Inferiores',
    'Bíceps',
    'Tríceps',
    'Abdômen/Lombar',
    'Ombro',
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditing ? 'Editar Exercício' : 'Novo Exercício'}</Text>
        <Text style={styles.label}>Tipo:</Text>
        <View style={styles.gruposContainer}>
          {gruposMusculares.map((grupo) => (
            <TouchableOpacity
              key={grupo}
              style={[
                styles.grupoButton,
                grupoMuscular === grupo && styles.grupoButtonSelected,
              ]}
              onPress={() => setGrupoMuscular(grupo)}
            >
              <Text style={styles.grupoButtonText}>{grupo}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Exercício</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do Exercício"
          value={nome}
          onChangeText={setNome}
        />
        <Text style={styles.label}>Execução</Text>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Série</Text>
          <TextInput style={styles.execucaoInput} value={series} onChangeText={setSeries} placeholder="" />
        </View>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Repetição</Text>
          <TextInput style={styles.execucaoInput} value={repeticoes} onChangeText={setRepeticoes} placeholder="" />
        </View>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Carga</Text>
          <TextInput style={styles.execucaoInput} value={carga} onChangeText={setCarga} placeholder="" />
        </View>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Ajuste</Text>
          <TextInput style={styles.execucaoInput} value={ajuste} onChangeText={setAjuste} placeholder="" />
        </View>
        <Button title="Salvar Exercício" onPress={handleSave} />
      </ScrollView>
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
  gruposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  grupoButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#fff',
  },
  grupoButtonSelected: {
    backgroundColor: '#cce5ff',
    borderColor: '#007bff',
  },
  grupoButtonText: {
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    fontSize: 16,
  },
  execucaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  execucaoLabel: {
    width: 80,
    fontSize: 15,
  },
  execucaoInput: {
    flex: 1,
    height: 36,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
});
