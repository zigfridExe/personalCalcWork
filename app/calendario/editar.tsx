import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Switch, Alert, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import useAlunosStore from '../../store/useAlunosStore';
import { Picker } from '@react-native-picker/picker';
import editarAulaStyles from '../../styles/editarAulaStyles';

export default function EditarAulaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { aulas, editarAula } = useAulasStore();
  const { alunos } = useAlunosStore();
  const aula = aulas.find(a => a.id === Number(id));

  const [alunoId, setAlunoId] = useState<number | null>(aula?.aluno_id || alunos[0]?.id || null);
  const [data, setData] = useState(aula?.data_aula || '');
  const [hora, setHora] = useState(aula?.hora_inicio || '');
  const [duracao, setDuracao] = useState(aula?.duracao_minutos ? String(aula.duracao_minutos) : '60');
  const [descricao, setDescricao] = useState(aula?.observacoes || '');
  const [presenca, setPresenca] = useState(aula?.presenca === 1);
  const [tipoAula, setTipoAula] = useState<'RECORRENTE_GERADA' | 'AVULSA' | 'EXCECAO_HORARIO' | 'EXCECAO_CANCELAMENTO'>(aula?.tipo_aula as any || 'AVULSA');

  useEffect(() => {
    if (aula) {
      setAlunoId(aula.aluno_id);
      setData(aula.data_aula);
      setHora(aula.hora_inicio);
      setDuracao(String(aula.duracao_minutos));
      setDescricao(aula.observacoes || '');
      setPresenca(aula.presenca === 1);
      setTipoAula(aula.tipo_aula);
    }
  }, [aula]);

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
    if (!alunoId || !data || !hora || !duracao) {
      Alert.alert('Preencha todos os campos!');
      return;
    }
    if (!aula) {
      Alert.alert('Aula não encontrada!');
      return;
    }

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

  const alunoInfo = alunos.find(a => a.id === aula?.aluno_id);

  if (!aula) {
    return (
      <View style={editarAulaStyles.container}>
        <Text style={editarAulaStyles.title}>Aula não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={editarAulaStyles.container}>
      <Text style={editarAulaStyles.title}>Editar Aula</Text>
      {alunoInfo && (
        <View style={editarAulaStyles.alunoInfoContainer}>
          <Text style={editarAulaStyles.alunoNome}>{alunoInfo.nome}</Text>
          {alunoInfo.contato && (
            <View style={editarAulaStyles.contatoContainer}>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/55${alunoInfo.contato.replace(/\D/g, '')}`)}
                style={editarAulaStyles.whatsappButton}
              >
                <Text style={editarAulaStyles.whatsappText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${alunoInfo.contato.replace(/\D/g, '')}`)}
              >
                <Text style={editarAulaStyles.ligarText}>Ligar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <Text style={editarAulaStyles.label}>Data</Text>
      <TextInput
        style={[
          editarAulaStyles.input,
          tipoAula === 'RECORRENTE_GERADA' && editarAulaStyles.inputDisabled
        ]}
        placeholder="DD/MM/AAAA"
        value={maskDataBR(data)}
        onChangeText={t => setData(maskDataBR(t))}
        maxLength={10}
        editable={tipoAula !== 'RECORRENTE_GERADA'}
      />
      <Text style={editarAulaStyles.label}>Hora</Text>
      <TextInput
        style={editarAulaStyles.input}
        placeholder="HH:MM"
        value={hora}
        onChangeText={t => setHora(formatHora(t))}
        keyboardType="default"
        maxLength={5}
      />
      <Text style={editarAulaStyles.label}>Duração (minutos)</Text>
      <TextInput
        style={editarAulaStyles.input}
        placeholder="60"
        value={duracao}
        onChangeText={t => setDuracao(t.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={3}
      />
      <Text style={editarAulaStyles.label}>Observações</Text>
      <TextInput
        style={editarAulaStyles.input}
        placeholder="Observações da Aula"
        value={descricao}
        onChangeText={setDescricao}
      />
      <Text style={editarAulaStyles.label}>Tipo de Aula</Text>
      <View style={editarAulaStyles.tipoButtonContainer}>
        <TouchableOpacity
          style={[editarAulaStyles.tipoBtn, tipoAula === 'AVULSA' && editarAulaStyles.tipoBtnAtivo]}
          onPress={() => setTipoAula('AVULSA')}
        >
          <Text style={tipoAula === 'AVULSA' ? editarAulaStyles.tipoButtonTextAtivo : editarAulaStyles.tipoButtonTextInativo}>Avulsa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[editarAulaStyles.tipoBtn, tipoAula === 'RECORRENTE_GERADA' && editarAulaStyles.tipoBtnAtivo]}
          onPress={() => setTipoAula('RECORRENTE_GERADA')}
        >
          <Text style={tipoAula === 'RECORRENTE_GERADA' ? editarAulaStyles.tipoButtonTextAtivo : editarAulaStyles.tipoButtonTextInativo}>Recorrente Gerada</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[editarAulaStyles.tipoBtn, tipoAula === 'EXCECAO_HORARIO' && editarAulaStyles.tipoBtnAtivo]}
          onPress={() => setTipoAula('EXCECAO_HORARIO')}
        >
          <Text style={tipoAula === 'EXCECAO_HORARIO' ? editarAulaStyles.tipoButtonTextAtivo : editarAulaStyles.tipoButtonTextInativo}>Exceção de Horário</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[editarAulaStyles.tipoBtn, tipoAula === 'EXCECAO_CANCELAMENTO' && editarAulaStyles.tipoBtnAtivo]}
          onPress={() => setTipoAula('EXCECAO_CANCELAMENTO')}
        >
          <Text style={tipoAula === 'EXCECAO_CANCELAMENTO' ? editarAulaStyles.tipoButtonTextAtivo : editarAulaStyles.tipoButtonTextInativo}>Exceção de Cancelamento</Text>
        </TouchableOpacity>
      </View>
      <Button title="Salvar" onPress={handleSalvar} color="#2196F3" />
    </View>
  );
}