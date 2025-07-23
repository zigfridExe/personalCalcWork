import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text, View } from 'react-native';
import useExerciciosStore from '../store/useExerciciosStore';
import useAlunosStore from '../store/useAlunosStore';
import { exerciciosPorGrupo } from '../utils/exerciciosPorGrupo';
import { Picker } from '@react-native-picker/picker';

export default function ModalExercicioScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // Ajuste: obtenha fichaId e exercicioId de route.params
  const { fichaId, exercicioId } = (route as any).params || {};
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
      // ...
    };

    if (isEditing) {
      await updateExercicio({ ...exercicioData, id: Number(exercicioId) });
    } else {
      await addExercicio(exercicioData);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* ...UI do modal... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // ...
  },
});
