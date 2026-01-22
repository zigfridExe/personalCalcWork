import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // Mantenho picker nativo por simplicidade ou customizar
import useAlunosStore from '../../store/useAlunosStore';
import useAulasStore from '../../store/useAulasStore';
import { maskDate, parseToISO, isValidDate, formatDate } from '@/utils/dateUtils';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme } from '@/styles/theme';
import { StatusBar } from 'expo-status-bar';

export default function NovaRecorrenciaScreen() {
  const router = useRouter();
  const { alunos } = useAlunosStore();
  const { criarRegraRecorrente } = useAulasStore();

  const [alunoId, setAlunoId] = useState<number | null>(null);
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]); // Array de dias

  // Usando strings para entrada simples (Workaround para Expo Go)
  const [horaTexto, setHoraTexto] = useState('08:00');
  const [duracao, setDuracao] = useState('60');
  const [dataInicioTexto, setDataInicioTexto] = useState(formatDate(new Date())); // DD/MM/AAAA

  const diasSemana = [
    { id: 0, label: 'Domingo' },
    { id: 1, label: 'Segunda' },
    { id: 2, label: 'Terça' },
    { id: 3, label: 'Quarta' },
    { id: 4, label: 'Quinta' },
    { id: 5, label: 'Sexta' },
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
    if (!isValidDate(dataInicioTexto)) {
      Alert.alert('Erro', 'Data inválida. Use DD/MM/AAAA (ex: 15/01/2026)');
      return;
    }

    const dataISO = parseToISO(dataInicioTexto);

    try {
      // Criar uma regra para cada dia selecionado
      const promises = diasSelecionados.map(dia =>
        criarRegraRecorrente(
          alunoId,
          dia,
          horaTexto,
          parseInt(duracao) || 60,
          dataISO
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
    <View style={styles.container}>
      <ScreenHeader title="Nova Recorrência" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.card}>
          <Text style={styles.label}>Aluno</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={alunoId}
              onValueChange={(itemValue) => setAlunoId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um aluno..." value={null} color={theme.colors.textSecondary} />
              {alunos.map(aluno => (
                <Picker.Item key={aluno.id} label={aluno.nome} value={aluno.id} color={theme.colors.text} />
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
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.label}>Duração (minutos)</Text>
          <TextInput
            style={styles.input}
            value={duracao}
            onChangeText={setDuracao}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.label}>Início da Vigência (DD/MM/AAAA)</Text>
          <TextInput
            style={styles.input}
            value={dataInicioTexto}
            onChangeText={t => setDataInicioTexto(maskDate(t))}
            placeholder="Ex: 15/01/2026"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <Text style={styles.saveButtonText}>CRIAR REGRA</Text>
          </TouchableOpacity>
        </View>

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
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.colors.background,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    overflow: 'hidden', // Importante para o border radius no Android
  },
  picker: {
    // Estilos específicos para picker se necessário
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  diaButton: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  diaButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  diaText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
  },
  diaTextSelected: {
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.title,
  },
});