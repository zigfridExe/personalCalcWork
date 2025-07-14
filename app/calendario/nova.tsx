import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import useAlunosStore from '../../store/useAlunosStore';

// Funções utilitárias para data/hora
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

export default function NovaAulaScreen() {
  const router = useRouter();
  const { adicionarAula } = useAulasStore();
  const { alunos } = useAlunosStore();
  const [alunoId, setAlunoId] = useState<number | null>(alunos[0]?.id || null);
  // Corrigido: inicializa a data com o horário local, evitando problemas de fuso horário/UTC
  const hoje = new Date();
  const [data, setData] = useState(
    maskDataBR(
      String(hoje.getDate()).padStart(2, '0') +
      String(hoje.getMonth() + 1).padStart(2, '0') +
      String(hoje.getFullYear())
    )
  );
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState('60');
  const [descricao, setDescricao] = useState('');
  const [presenca, setPresenca] = useState(false);
  const [tipoAula, setTipoAula] = useState<'AVULSA' | 'RECORRENTE'>('AVULSA');

  const handleSalvar = async () => {
    if (!alunoId || !data || !hora || !duracao || !descricao) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    if (!isDataValidaBR(data)) {
      Alert.alert('Data inválida! Use o formato DD/MM/AAAA.');
      return;
    }
    if (!isHoraValida(hora)) {
      Alert.alert('Horário inválido! Use o formato HH:MM.');
      return;
    }
    await adicionarAula({
      aluno_id: alunoId,
      data_aula: formatDataISO(data),
      hora_inicio: hora,
      duracao_minutos: Number(duracao),
      presenca: presenca ? 1 : 0,
      observacoes: descricao,
      tipo_aula: tipoAula,
      horario_recorrente_id: null,
    });
    Alert.alert('Aula adicionada com sucesso!');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Nova Aula</Text>
      <Text style={styles.label}>Aluno</Text>
      <View style={styles.selectAluno}>
        {alunos.map(aluno => (
          <Button
            key={aluno.id}
            title={aluno.nome}
            color={alunoId === aluno.id ? '#1976D2' : '#888'}
            onPress={() => setAlunoId(aluno.id)}
          />
        ))}
      </View>
      <Text style={styles.label}>Data</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={data}
        onChangeText={t => setData(maskDataBR(t))}
        maxLength={10}
      />
      <Text style={styles.label}>Hora</Text>
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
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Descrição da Aula"
        value={descricao}
        onChangeText={setDescricao}
      />
      <View style={styles.switchRow}>
        <Text>Presença:</Text>
        <Switch value={presenca} onValueChange={setPresenca} />
      </View>
      <Text style={styles.label}>Tipo de Aula</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity
          style={[styles.tipoBtn, tipoAula === 'AVULSA' && styles.tipoBtnAtivo]}
          onPress={() => setTipoAula('AVULSA')}
        >
          <Text style={tipoAula === 'AVULSA' ? { color: '#fff' } : {}}>Avulsa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoBtn, tipoAula === 'RECORRENTE' && styles.tipoBtnAtivo]}
          onPress={() => setTipoAula('RECORRENTE')}
        >
          <Text style={tipoAula === 'RECORRENTE' ? { color: '#fff' } : {}}>Recorrente</Text>
        </TouchableOpacity>
      </View>
      <Button title="Salvar" onPress={handleSalvar} color="#4CAF50" />
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
  selectAluno: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  tipoBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  tipoBtnAtivo: {
    backgroundColor: '#1976D2',
  },
});