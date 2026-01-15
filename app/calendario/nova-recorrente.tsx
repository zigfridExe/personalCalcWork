import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import useAlunosStore from '../../store/useAlunosStore';
import useAulasStore from '../../store/useAulasStore';
import ScreenHeader from '@/shared/components/ScreenHeader';

export default function NovaRecorrenciaScreen() {
  const router = useRouter();
  const { alunos } = useAlunosStore();
  const { criarRegraRecorrente } = useAulasStore();

  const [alunoId, setAlunoId] = useState<number | null>(null);
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]); // Array de dias

  // Usando strings para entrada simples (Workaround para Expo Go)
  const [horaTexto, setHoraTexto] = useState('08:00');
  const [duracao, setDuracao] = useState('60');
  const [dataInicioTexto, setDataInicioTexto] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  const diasSemana = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' },
  ];

  const toggleDia = (diaId: number) => {
    setDiasSelecionados(prev => {
      if (prev.includes(diaId)) {
        return prev.filter(d => d !== diaId);
      } else {
        return [...prev, diaId].sort();
      }
    });
  };

  const handleSalvar = async () => {
    if (!alunoId) {
      Alert.alert('Erro', 'Selecione um aluno.');
      return;
    }

    if (diasSelecionados.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana.');
      return;
    }

    // Validação básica de horário
    if (!/^\d{2}:\d{2}$/.test(horaTexto)) {
      Alert.alert('Erro', 'Formato de hora inválido. Use HH:MM (ex: 14:30)');
      return;
    }

    // Validação básica de data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicioTexto)) {
      Alert.alert('Erro', 'Formato de data inválido. Use YYYY-MM-DD (ex: 2026-01-15)');
      return;
    }

    try {
      // Criar uma regra para cada dia selecionado
      const promises = diasSelecionados.map(dia =>
        criarRegraRecorrente(
          alunoId,
          dia,
          horaTexto,
          parseInt(duracao) || 60,
          dataInicioTexto
        )
      );

      await Promise.all(promises);

      Alert.alert('Sucesso', 'Regras recorrentes criadas!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao criar regras.');
    }
  };

  return (
    <>
      <ScreenHeader title="Nova Recorrência" />
      <ScrollView style={styles.container}>

        <Text style={styles.label}>Aluno</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={alunoId}
            onValueChange={(itemValue) => setAlunoId(itemValue)}
          >
            <Picker.Item label="Selecione um aluno..." value={null} />
            {alunos.map(aluno => (
              <Picker.Item key={aluno.id} label={aluno.nome} value={aluno.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Dias da Semana</Text>
        <View style={styles.diasContainer}>
          {diasSemana.map(dia => (
            <TouchableOpacity
              key={dia.id}
              style={[
                styles.diaButton,
                diasSelecionados.includes(dia.id) && styles.diaButtonSelected
              ]}
              onPress={() => toggleDia(dia.id)}
            >
              <Text style={[
                styles.diaText,
                diasSelecionados.includes(dia.id) && styles.diaTextSelected
              ]}>
                {dia.label.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Horário de Início (HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={horaTexto}
          onChangeText={setHoraTexto}
          placeholder="Ex: 14:30"
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Duração (minutos)</Text>
        <TextInput
          style={styles.input}
          value={duracao}
          onChangeText={setDuracao}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Início da Vigência (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dataInicioTexto}
          onChangeText={setDataInicioTexto}
          placeholder="Ex: 2026-01-15"
          keyboardType="default"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>Criar Regra</Text>
        </TouchableOpacity>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  inputButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diaButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    minWidth: 45,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  diaButtonSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  diaText: {
    color: '#333',
  },
  diaTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 50,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});