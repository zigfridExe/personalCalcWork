import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import useAlunosStore from '../../store/useAlunosStore';
import { getDatabase } from '../../utils/databaseUtils';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import novaRecorrenteStyles from '../../styles/novaRecorrenteStyles';

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
    <View style={novaRecorrenteStyles.container}>
      <Text style={novaRecorrenteStyles.title}>Nova Aula Recorrente</Text>
      <Text style={novaRecorrenteStyles.label}>Aluno</Text>
      <View style={novaRecorrenteStyles.pickerWrapper}>
        <Picker
          selectedValue={alunoId}
          onValueChange={itemValue => setAlunoId(itemValue)}
          style={novaRecorrenteStyles.picker}
          itemStyle={novaRecorrenteStyles.pickerItem}
        >
          {alunos.map(aluno => (
            <Picker.Item key={aluno.id} label={aluno.nome} value={aluno.id} />
          ))}
        </Picker>
      </View>
      <Text style={novaRecorrenteStyles.label}>Dias da Semana</Text>
      <View style={novaRecorrenteStyles.diasSemanaRow}>
        {diasSemanaLabels.map((dia, idx) => (
          <TouchableOpacity
            key={dia}
            style={[novaRecorrenteStyles.diaBtn, diasSemana.includes(idx) && novaRecorrenteStyles.diaBtnAtivo]}
            onPress={() => handleToggleDia(idx)}
          >
            <Text style={diasSemana.includes(idx) ? novaRecorrenteStyles.diaBtnTextAtivo : novaRecorrenteStyles.diaBtnTextInativo}>{dia}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={novaRecorrenteStyles.label}>Hora de Início</Text>
      <TextInput
        style={novaRecorrenteStyles.input}
        placeholder="HH:MM"
        value={hora}
        onChangeText={t => setHora(formatHora(t))}
        keyboardType="default"
        maxLength={5}
      />
      <Text style={novaRecorrenteStyles.label}>Duração (minutos)</Text>
      <TextInput
        style={novaRecorrenteStyles.input}
        placeholder="60"
        value={duracao}
        onChangeText={t => setDuracao(t.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={3}
      />
      <Text style={novaRecorrenteStyles.label}>Data de Início</Text>
      <TextInput
        style={novaRecorrenteStyles.input}
        placeholder="DD/MM/AAAA"
        value={dataInicio}
        onChangeText={t => setDataInicio(maskDataBR(t))}
        maxLength={10}
      />
      <Text style={novaRecorrenteStyles.label}>Data de Fim (opcional)</Text>
      <TextInput
        style={novaRecorrenteStyles.input}
        placeholder="DD/MM/AAAA"
        value={dataFim}
        onChangeText={t => setDataFim(maskDataBR(t))}
        maxLength={10}
      />
      <Button title="Salvar" onPress={handleSalvar} color="#1976D2" />
    </View>
  );
} 