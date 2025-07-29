import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/styles/Themed';
import useExerciciosStore from '../store/useExerciciosStore';
import useAlunosStore from '../store/useAlunosStore';
import { exerciciosPorGrupo } from '../utils/exerciciosPorGrupo';
import { Picker } from '@react-native-picker/picker';

export default function ModalExercicioScreen() {
  const router = useRouter();
  const { fichaId, exercicioId } = useLocalSearchParams();
  const { exercicios, addExercicio, updateExercicio } = useExerciciosStore();
  const { initializeDatabase } = useAlunosStore();

  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [maquina, setMaquina] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [carga, setCarga] = useState('');
  const [ajuste, setAjuste] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [descanso, setDescanso] = useState('');

  const isEditing = !!exercicioId;

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
    };
    initDB();
  }, [initializeDatabase]);

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
        setDescanso(exercicioToEdit.descanso || '');
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
      descanso,
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
        <Picker
          enabled={!!grupoMuscular}
          selectedValue={nome}
          onValueChange={setNome}
          style={{ width: '80%', marginBottom: 10 }}
        >
          <Picker.Item label={grupoMuscular ? 'Selecione o exercício' : 'Selecione o grupo muscular primeiro'} value="" />
          {grupoMuscular && exerciciosPorGrupo[grupoMuscular]?.map((ex, idx) => (
            <Picker.Item key={idx} label={ex} value={ex} />
          ))}
        </Picker>
        <TextInput
          style={styles.input}
          placeholder="Ou digite o nome do exercício"
          value={nome}
          onChangeText={setNome}
        />
        <Text style={styles.label}>Execução</Text>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Série</Text>
          <Picker
            selectedValue={series}
            onValueChange={setSeries}
            style={{ flex: 1, height: 36 }}
          >
            <Picker.Item label="Selecione" value="" />
            <Picker.Item label="1" value="1" />
            <Picker.Item label="3" value="3" />
            <Picker.Item label="4" value="4" />
            <Picker.Item label="5" value="5" />
          </Picker>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="Ou digite"
            value={series}
            onChangeText={setSeries}
          />
        </View>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Repetição</Text>
          <Picker
            selectedValue={repeticoes}
            onValueChange={setRepeticoes}
            style={{ flex: 1, height: 36 }}
          >
            <Picker.Item label="Selecione" value="" />
            <Picker.Item label="12" value="12" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="Falha" value="Falha" />
          </Picker>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="Ou digite"
            value={repeticoes}
            onChangeText={setRepeticoes}
          />
        </View>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Carga</Text>
          <Picker
            selectedValue={carga}
            onValueChange={setCarga}
            style={{ flex: 1, height: 36 }}
          >
            <Picker.Item label="Selecione" value="" />
            <Picker.Item label="1" value="1" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="20" value="20" />
            <Picker.Item label="25" value="25" />
            <Picker.Item label="30" value="30" />
            <Picker.Item label="35" value="35" />
            <Picker.Item label="40" value="40" />
          </Picker>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="Ou digite"
            value={carga}
            onChangeText={setCarga}
          />
        </View>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Ajuste</Text>
          <Picker
            selectedValue={ajuste}
            onValueChange={setAjuste}
            style={{ flex: 1, height: 36 }}
          >
            <Picker.Item label="Selecione" value="" />
            {Array.from({ length: 10 }, (_, i) => (
              <Picker.Item key={i+1} label={`${i+1}`} value={`${i+1}`} />
            ))}
          </Picker>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="Ou digite"
            value={ajuste}
            onChangeText={setAjuste}
          />
        </View>
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>Descanso</Text>
          <Picker
            selectedValue={descanso}
            onValueChange={setDescanso}
            style={{ flex: 1, height: 36 }}
          >
            <Picker.Item label="Selecione" value="" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="8" value="8" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="30" value="30" />
            <Picker.Item label="60" value="60" />
          </Picker>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="Ou digite"
            value={descanso}
            onChangeText={setDescanso}
          />
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
