import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import useAlunosStore from '../../store/useAlunosStore';
import { Picker } from '@react-native-picker/picker';
import { RRule, rrulestr } from 'rrule';

export default function EditarAulaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { aulas, editarAula } = useAulasStore();
  const { alunos } = useAlunosStore();
  const aula = aulas.find(a => a.id === Number(id));

  // Estados para edição (agora igual à tela de nova aula)
  const [alunoId, setAlunoId] = useState<number | null>(aula?.aluno_id || alunos[0]?.id || null);
  const [data, setData] = useState(aula?.data_aula || '');
  const [hora, setHora] = useState(aula?.hora_inicio || '');
  const [duracao, setDuracao] = useState(aula?.duracao_minutos ? String(aula.duracao_minutos) : '60');
  const [descricao, setDescricao] = useState(aula?.observacoes || '');
  const [presenca, setPresenca] = useState(aula?.presenca === 1);
  const [tipoAula, setTipoAula] = useState<'AVULSA' | 'RECORRENTE' | 'SOBREESCRITA' | 'CANCELADA_RECORRENTE'>(aula?.tipo_aula as any || 'AVULSA');
  const [diasSemana, setDiasSemana] = useState<number[]>(() => {
    if (aula?.tipo_aula === 'RECORRENTE' && aula.rrule) {
      try {
        const rule = rrulestr(aula.rrule);
        if (rule.options.byweekday) {
          if (Array.isArray(rule.options.byweekday)) {
            return rule.options.byweekday.map((d: any) => {
              if (typeof d === 'number') return d;
              if (d && typeof d === 'object' && d !== null && 'weekday' in d && typeof d.weekday === 'number') return d.weekday;
              return 0;
            });
          } else {
            const d = rule.options.byweekday;
            if (typeof d === 'number') return [d];
            if (d && typeof d === 'object' && d !== null && 'weekday' in d && typeof d.weekday === 'number') return [d.weekday];
            return [0];
          }
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [dataInicioRec, setDataInicioRec] = useState(() => {
    if (aula?.tipo_aula === 'RECORRENTE' && aula.rrule) {
      try {
        const rule = rrulestr(aula.rrule);
        return rule.options.dtstart ? maskDataBR(rule.options.dtstart.toISOString().slice(0, 10)) : maskDataBR(aula.data_aula);
      } catch {
        return maskDataBR(aula.data_aula);
      }
    }
    return maskDataBR(aula?.data_aula || '');
  });
  const [dataFimRec, setDataFimRec] = useState(() => {
    if (aula?.tipo_aula === 'RECORRENTE' && aula.rrule) {
      try {
        const rule = rrulestr(aula.rrule);
        return rule.options.until ? maskDataBR(rule.options.until.toISOString().slice(0, 10)) : maskDataBR(aula.data_aula);
      } catch {
        return maskDataBR(aula.data_aula);
      }
    }
    return maskDataBR(aula?.data_aula || '');
  });
  function handleToggleDia(idx: number) {
    setDiasSemana(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
  }

  useEffect(() => {
    if (aula) {
      setAlunoId(aula.aluno_id);
      setData(aula.data_aula);
      setHora(aula.hora_inicio);
      setDuracao(String(aula.duracao_minutos));
      setDescricao(aula.observacoes || '');
      setPresenca(aula.presenca === 1);
      setTipoAula(aula.tipo_aula);
      if (aula.tipo_aula === 'RECORRENTE' && aula.rrule) {
        try {
          const rule = rrulestr(aula.rrule);
          setDiasSemana(rule.options.byweekday ? (Array.isArray(rule.options.byweekday) ? rule.options.byweekday.map((d: any) => {
            if (typeof d === 'number') return d;
            if (d && typeof d === 'object' && d !== null && 'weekday' in d && typeof d.weekday === 'number') return d.weekday;
            return 0;
          }) : [typeof rule.options.byweekday === 'number' ? rule.options.byweekday : (rule.options.byweekday && typeof rule.options.byweekday === 'object' && rule.options.byweekday !== null && 'weekday' in rule.options.byweekday && typeof rule.options.byweekday.weekday === 'number' ? rule.options.byweekday.weekday : 0)]) : []);
          setDataInicioRec(rule.options.dtstart ? maskDataBR(rule.options.dtstart.toISOString().slice(0, 10)) : maskDataBR(aula.data_aula));
          setDataFimRec(rule.options.until ? maskDataBR(rule.options.until.toISOString().slice(0, 10)) : maskDataBR(aula.data_aula));
        } catch {
          // Fallback if rrule parsing fails
          setDiasSemana([]);
          setDataInicioRec(maskDataBR(aula.data_aula));
          setDataFimRec(maskDataBR(aula.data_aula));
        }
      } else {
        setDiasSemana([]);
        setDataInicioRec(maskDataBR(aula.data_aula));
        setDataFimRec(maskDataBR(aula.data_aula));
      }
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
  function isDataValidaBR(data: string) {
    if (!data) return false;
    const [d, m, y] = data.split('/');
    const date = new Date(`${y}-${m}-${d}`);
    return !isNaN(date.getTime());
  }

  const handleSalvar = async () => {
    if (!alunoId || !data || !hora || !duracao) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    if (!aula) {
      Alert.alert('Aula não encontrada!');
      return;
    }
    if (tipoAula === 'RECORRENTE') {
      if (diasSemana.length === 0) {
        Alert.alert('Selecione pelo menos um dia da semana para a recorrência!');
        return;
      }
      if (!isDataValidaBR(dataInicioRec) || !isDataValidaBR(dataFimRec)) {
        Alert.alert('Datas de início e fim da recorrência inválidas!');
        return;
      }
      const weekdayMap = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
      const byweekday = diasSemana.map(idx => weekdayMap[idx]);
      const dtstart = new Date(formatDataISO(dataInicioRec) + 'T' + hora + ':00');
      const until = new Date(formatDataISO(dataFimRec) + 'T' + hora + ':00');
      const rule = new RRule({
        freq: RRule.WEEKLY,
        byweekday,
        dtstart,
        until,
      });
      const rruleString = rule.toString();
      await editarAula({
        id: Number(id),
        aluno_id: alunoId,
        data_aula: formatDataISO(dataInicioRec),
        hora_inicio: hora,
        duracao_minutos: Number(duracao),
        observacoes: descricao,
        presenca: presenca ? 1 : 0,
        tipo_aula: 'RECORRENTE',
        horario_recorrente_id: aula.horario_recorrente_id ?? null,
        rrule: rruleString,
        data_avulsa: undefined,
        sobrescrita_id: aula.sobrescrita_id ?? undefined,
        cancelada_por_id: aula.cancelada_por_id ?? undefined,
      });
      Alert.alert('Aula recorrente editada com sucesso!');
      router.back();
      return;
    }
    // Aula avulsa ou outros tipos
    await editarAula({
      id: Number(id),
      aluno_id: alunoId,
      data_aula: formatDataISO(data),
      hora_inicio: hora,
      duracao_minutos: Number(duracao),
      observacoes: descricao,
      presenca: presenca ? 1 : 0,
      tipo_aula: tipoAula,
      horario_recorrente_id: aula.horario_recorrente_id ?? null,
      rrule: undefined,
      data_avulsa: tipoAula === 'AVULSA' ? formatDataISO(data) : undefined,
      sobrescrita_id: aula.sobrescrita_id ?? undefined,
      cancelada_por_id: aula.cancelada_por_id ?? undefined,
    });
    Alert.alert('Aula editada com sucesso!');
    router.back();
  };

  // Buscar dados do aluno para exibir nome e contato
  const alunoInfo = alunos.find(a => a.id === aula?.aluno_id);

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
      {alunoInfo && (
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{alunoInfo.nome}</Text>
          {alunoInfo.contato && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/55${alunoInfo.contato.replace(/\D/g, '')}`)}
                style={{ marginRight: 16 }}
              >
                <Text style={{ color: '#25D366', fontWeight: 'bold' }}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${alunoInfo.contato.replace(/\D/g, '')}`)}
              >
                <Text style={{ color: '#1976D2', fontWeight: 'bold' }}>Ligar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <Text style={styles.label}>Data</Text>
      <TextInput
        style={[
          styles.input,
          tipoAula === 'RECORRENTE' && styles.inputDisabled
        ]}
        placeholder="DD/MM/AAAA"
        value={maskDataBR(data)}
        onChangeText={t => setData(maskDataBR(t))}
        maxLength={10}
        editable={tipoAula !== 'RECORRENTE'}
      />
      {tipoAula === 'RECORRENTE' && (
        <>
          <Text style={styles.label}>A partir de qual data?</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={dataInicioRec}
            onChangeText={t => setDataInicioRec(maskDataBR(t))}
            maxLength={10}
          />
        </>
      )}
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
      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={styles.input}
        placeholder="Observações da Aula"
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
      {tipoAula === 'RECORRENTE' && (
        <View style={styles.diasSemanaContainer}>
          <Text style={styles.label}>Dias da Semana</Text>
          <View style={styles.diasSemanaRow}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, idx) => (
              <TouchableOpacity
                key={dia}
                style={[styles.diaBtn, diasSemana.includes(idx) && styles.diaBtnAtivo]}
                onPress={() => handleToggleDia(idx)}
              >
                <Text style={diasSemana.includes(idx) ? { color: '#fff' } : {}}>{dia}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
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
  inputDisabled: {
    backgroundColor: '#e0e0e0', // Cor para indicar que o campo está desabilitado
    color: '#888', // Cor para o texto dentro do campo desabilitado
  },
  pickerWrapper: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  pickerItem: {
    fontSize: 16,
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
  diasSemanaContainer: {
    width: '80%',
    marginBottom: 15,
  },
  diasSemanaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  diaBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  diaBtnAtivo: {
    backgroundColor: '#1976D2',
  },
});