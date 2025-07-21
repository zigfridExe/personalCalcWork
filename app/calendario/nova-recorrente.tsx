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
}
function maskDataBR(data: string) {
  let digits = data.replace(/\D/g, '');
  if (digits.length > 8) digits = digits.slice(0, 8);
  if (digits.length > 4) {
    return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  } else if (digits.length > 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  } else {
    return digits;
  }
}
function formatDataISO(data: string) {
  if (!data) return '';
  if (data.includes('/')) {
    const [d, m, y] = data.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return data;
}
function isDataValidaBR(data: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(data);
}

export default function NovaAulaRecorrenteScreen() {
  const { alunos } = useAlunosStore();
  const [alunoId, setAlunoId] = useState<number | null>(alunos[0]?.id || null);
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('60');
  const hoje = new Date();
  const [dataInicio, setDataInicio] = useState(maskDataBR(String(hoje.getDate()).padStart(2, '0') + String(hoje.getMonth() + 1).padStart(2, '0') + String(hoje.getFullYear())));
  const [dataFim, setDataFim] = useState('');
  const router = useRouter();

  const handleToggleDia = (dia: number) => {
    setDiasSemana(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
  };

  const handleSalvar = async () => {
    console.log('Dias da semana selecionados:', diasSemana.map(idx => diasSemanaLabels[idx]), diasSemana);
    if (!alunoId || diasSemana.length === 0 || !hora || !duracao || !dataInicio) {
      Alert.alert('Preencha todos os campos obrigatórios!');
      return;
    }
    if (!isHoraValida(hora)) {
      Alert.alert('Horário inválido! Use o formato HH:MM.');
      return;
    }
    if (!isDataValidaBR(dataInicio)) {
      Alert.alert('Data de início inválida! Use o formato DD/MM/AAAA.');
      return;
    }
    if (dataFim && !isDataValidaBR(dataFim)) {
      Alert.alert('Data de fim inválida! Use o formato DD/MM/AAAA.');
      return;
    }
    try {
      const db = await getDatabase();
      for (const dia of diasSemana) {
        await db.runAsync(
          `INSERT INTO horarios_recorrentes (aluno_id, dia_semana, hora_inicio, duracao_minutos, data_inicio_vigencia, data_fim_vigencia)
           VALUES (?, ?, ?, ?, ?, ?);`,
          alunoId,
          dia,
          hora,
          Number(duracao),
          formatDataISO(dataInicio),
          dataFim ? formatDataISO(dataFim) : null
        );
      }
      Alert.alert('Padrão recorrente cadastrado com sucesso!');
      router.back(); // volta para o calendário
    } catch (e) {
      Alert.alert('Erro ao salvar padrão recorrente:', String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Aula Recorrente</Text>
      <Text style={styles.label}>Aluno</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={alunoId}
          onValueChange={itemValue => setAlunoId(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {alunos.map(aluno => (
            <Picker.Item key={aluno.id} label={aluno.nome} value={aluno.id} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Dias da Semana</Text>
      <View style={styles.diasSemanaRow}>
        {diasSemanaLabels.map((dia, idx) => (
          <TouchableOpacity
            key={dia}
            style={[styles.diaBtn, diasSemana.includes(idx) && styles.diaBtnAtivo]}
            onPress={() => handleToggleDia(idx)}
          >
            <Text style={diasSemana.includes(idx) ? { color: '#fff' } : {}}>{dia}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Hora de Início</Text>
      <TextInput
        style={styles.input}
        placeholder="HH:MM"
        value={hora}
        onChangeText={t => setHora(formatHora(t))}
        keyboardType="default"
        maxLength={5}
      />
      <Text style={styles.label}>Duração (minutos)</Text>
      <TextInput
        style={styles.input}
        placeholder="60"
        value={duracao}
        onChangeText={t => setDuracao(t.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={3}
      />
      <Text style={styles.label}>Data de Início</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={dataInicio}
        onChangeText={t => setDataInicio(maskDataBR(t))}
        maxLength={10}
      />
      <Text style={styles.label}>Data de Fim (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={dataFim}
        onChangeText={t => setDataFim(maskDataBR(t))}
        maxLength={10}
      />
      <Button title="Salvar" onPress={handleSalvar} color="#1976D2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
  },
  input: {
    width: '95%',
    height: 48,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    fontSize: 16,
  },
  pickerWrapper: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
  },
  picker: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  pickerItem: {
    fontSize: 18,
    height: 48,
    textAlign: 'left',
  },
  diasSemanaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 15,
    width: '95%',
  },
  diaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginHorizontal: 2,
  },
  diaBtnAtivo: {
    backgroundColor: '#1976D2',
  },
  alunoDisplay: {
    width: '95%',
    minHeight: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alunoNome: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
}); 