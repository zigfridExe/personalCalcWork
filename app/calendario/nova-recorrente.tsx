import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import useAlunosStore from '../../store/useAlunosStore';
import { getDatabase } from '../../utils/databaseUtils';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const diasSemanaLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatHora(hora: string) {
  let digits = hora.replace(/\D/g, '');
  if (digits.length > 4) digits = digits.slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + ':' + digits.slice(2);
  } else if (digits.length >= 1) {
    return digits;
  }
  return '';
}
function isHoraValida(hora: string) {
  const match = hora.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const h = Number(match[1]);
  const m = Number(match[2]);
  return h >= 0 && h < 24 && m >= 0 && m < 60;
  import DateTimePicker from '@react-native-community/datetimepicker';
  import { Picker } from '@react-native-picker/picker'; // Verifique se esta lib está instalada
  import useAlunosStore from '../../store/useAlunosStore';
  import useAulasStore from '../../store/useAulasStore';
  import ScreenHeader from '@/shared/components/ScreenHeader';

  export default function NovaRecorrenciaScreen() {
    const router = useRouter();
    const { alunos } = useAlunosStore();
    const { criarRegraRecorrente } = useAulasStore();

    const [alunoId, setAlunoId] = useState<number | null>(null);
    const [diaSemana, setDiaSemana] = useState<number>(1); // 0=Dom, 1=Seg...
    const [horaInicio, setHoraInicio] = useState(new Date());
    const [duracao, setDuracao] = useState('60');
    const [dataInicio, setDataInicio] = useState(new Date());

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const diasSemana = [
      { id: 0, label: 'Domingo' },
      { id: 1, label: 'Segunda-feira' },
      { id: 2, label: 'Terça-feira' },
      { id: 3, label: 'Quarta-feira' },
      { id: 4, label: 'Quinta-feira' },
      { id: 5, label: 'Sexta-feira' },
      { id: 6, label: 'Sábado' },
    ];

    const handleSalvar = async () => {
      if (!alunoId) {
        Alert.alert('Erro', 'Selecione um aluno.');
        return;
      }

      const horaFormatada = horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dataInicioFormatada = dataInicio.toISOString().slice(0, 10);

      try {
        await criarRegraRecorrente(
          alunoId,
          diaSemana,
          horaFormatada,
          parseInt(duracao) || 60,
          dataInicioFormatada
        );

        Alert.alert('Sucesso', 'Regra recorrente criada!');
        router.back();
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao criar regra.');
      }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
      setShowTimePicker(Platform.OS === 'ios');
      if (selectedDate) setHoraInicio(selectedDate);
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) setDataInicio(selectedDate);
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

          <Text style={styles.label}>Dia da Semana</Text>
          <View style={styles.diasContainer}>
            {diasSemana.map(dia => (
              <TouchableOpacity
                key={dia.id}
                style={[
                  styles.diaButton,
                  diaSemana === dia.id && styles.diaButtonSelected
                ]}
                onPress={() => setDiaSemana(dia.id)}
              >
                <Text style={[
                  styles.diaText,
                  diaSemana === dia.id && styles.diaTextSelected
                ]}>
                  {dia.label.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Horário de Início</Text>
          <TouchableOpacity style={styles.inputButton} onPress={() => setShowTimePicker(true)}>
            <Text>{horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={horaInicio}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}

          <Text style={styles.label}>Duração (minutos)</Text>
          <TextInput
            style={styles.input}
            value={duracao}
            onChangeText={setDuracao}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Início da Vigência</Text>
          <TouchableOpacity style={styles.inputButton} onPress={() => setShowDatePicker(true)}>
            <Text>{dataInicio.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dataInicio}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

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
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    alunoNome: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#222',
    },
  }); 