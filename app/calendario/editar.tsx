import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';

export default function EditarAulaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { aulas, editarAula } = useAulasStore();
  const aula = aulas.find(a => a.id === Number(id));

  // Corrigir campos conforme interface Aula
  const [data, setData] = useState(aula?.data_aula || '');
  const [hora, setHora] = useState(aula?.hora_inicio || '');
  const [descricao, setDescricao] = useState(aula?.observacoes || '');
  // presenca é number: 0=Agendada, 1=Presente, 2=Faltou, 3=Cancelada
  const [presenca, setPresenca] = useState(aula?.presenca === 1);
  // tipoAula aceita todos os tipos
  const [tipoAula, setTipoAula] = useState(aula?.tipo_aula || 'AVULSA');

  useEffect(() => {
    if (aula) {
      setData(aula.data_aula);
      setHora(aula.hora_inicio);
      setDescricao(aula.observacoes || '');
      setPresenca(aula.presenca === 1);
      setTipoAula(aula.tipo_aula);
    }
  }, [aula]);

  // Máscara para data DD/MM/AAAA <-> YYYY-MM-DD
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
  function formatDataBR(data: string) {
    if (!data) return '';
    if (data.includes('-')) {
      const [y, m, d] = data.split('-');
      return `${d}/${m}/${y}`;
    }
    return data;
  }
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

  const handleSalvar = async () => {
    if (!data || !hora || !descricao) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    if (!aula) {
      Alert.alert('Aula não encontrada!');
      return;
    }
    await editarAula({
      id: Number(id),
      aluno_id: aula.aluno_id,
      data_aula: formatDataISO(data),
      hora_inicio: hora,
      duracao_minutos: aula.duracao_minutos,
      observacoes: descricao,
      presenca: presenca ? 1 : 0,
      tipo_aula: tipoAula,
    });
    Alert.alert('Aula editada com sucesso!');
    router.back();
  };

  if (!aula) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aula não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Aula</Text>
      <TextInput
        style={styles.input}
        placeholder="Data (DD/MM/AAAA)"
        value={formatDataBR(data)}
        onChangeText={t => setData(maskDataBR(t))}
        maxLength={10}
      />
      <TextInput
        style={styles.input}
        placeholder="Hora (HH:MM)"
        value={hora}
        onChangeText={t => setHora(formatHora(t))}
        maxLength={5}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição da Aula"
        value={descricao}
        onChangeText={setDescricao}
      />
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
        <TouchableOpacity
          style={[styles.tipoBtn, tipoAula === 'SOBREESCRITA' && styles.tipoBtnAtivo]}
          onPress={() => setTipoAula('SOBREESCRITA')}
        >
          <Text style={tipoAula === 'SOBREESCRITA' ? { color: '#fff' } : {}}>Sobreescrita</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoBtn, tipoAula === 'CANCELADA_RECORRENTE' && styles.tipoBtnAtivo]}
          onPress={() => setTipoAula('CANCELADA_RECORRENTE')}
        >
          <Text style={tipoAula === 'CANCELADA_RECORRENTE' ? { color: '#fff' } : {}}>Cancelada</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.switchRow}>
        <Text>Presença:</Text>
        <Switch value={presenca} onValueChange={v => setPresenca(v)} />
      </View>
      <Button title="Salvar" onPress={handleSalvar} color="#2196F3" />
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
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
  },
});