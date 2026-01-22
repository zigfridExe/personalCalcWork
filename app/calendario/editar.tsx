import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import useAlunosStore from '../../store/useAlunosStore';
import { Picker } from '@react-native-picker/picker';
import { formatDate, maskDate, parseToISO, isValidDate } from '@/utils/dateUtils';
// Remover importação e uso de RRule, rrulestr
// Ajustar estados e selects para não usar mais 'RECORRENTE' ou 'CANCELADA_RECORRENTE'
// Usar apenas os tipos: 'RECORRENTE_GERADA', 'AVULSA', 'EXCECAO_HORARIO', 'EXCECAO_CANCELAMENTO'
// Remover toda lógica de manipulação de rrule
// Simplificar o handleSalvar para não gerar nem salvar rrule

export default function EditarAulaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { aulasVisuais, editarAula } = useAulasStore();
  const { alunos } = useAlunosStore();
  const aula = aulasVisuais.find(a => a.id === Number(id));

  // @ts-ignore - Propriedades raw adicionadas manualmente ao tipo
  const [alunoId, setAlunoId] = useState<number | null>(aula?.aluno_id || alunos[0]?.id || null);
  // @ts-ignore
  const [data, setData] = useState(formatDate(aula?.data || ''));
  // @ts-ignore
  const [hora, setHora] = useState(aula?.hora || '08:00');
  // @ts-ignore
  const [duracao, setDuracao] = useState(aula?.duracao?.toString() || '60');
  const [descricao, setDescricao] = useState(aula?.observacoes || '');
  // @ts-ignore
  const [tipoAula, setTipoAula] = useState(aula?.raw_tipo || 'AVULSA');
  // @ts-ignore
  const [presenca, setPresenca] = useState(aula?.raw_presenca || 0);

  const handleSalvar = async () => {
    if (!alunoId) return;

    // Validação da data
    if (!isValidDate(data)) {
      Alert.alert('Erro', 'Data inválida! Use o formato DD/MM/AAAA.');
      return;
    }

    const dataISO = parseToISO(data);
    if (!dataISO) {
      Alert.alert('Erro', 'Data inválida!');
      return;
    }

    try {
      await editarAula({
        id: Number(id),
        aluno_id: alunoId,
        data_aula: dataISO,
        hora_inicio: hora,
        duracao_minutos: Number(duracao),
        presenca: Number(presenca),
        observacoes: descricao,
        tipo_aula: tipoAula,
        // @ts-ignore
        horario_recorrente_id: aula?.recorrencia_id,
        // @ts-ignore
        sobrescrita_id: aula?.sobrescrita_id,
        // @ts-ignore
        cancelada_por_id: aula?.cancelada_por_id
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao atualizar aula');
    }
  };

  const alunoInfo = alunos.find(a => a.id === alunoId);

  if (!aulaLinkCheck(aula, id)) {
    // Check if aula exists or handle loading
  }

  // Helper to allow TS check to fail gracefully if aula is missing but ID is present (loading?)
  // Actually, standard check:
  if (!aula) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aula não encontrada.</Text>
      </View>
    );
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Aula</Text>
      {alunoInfo && (
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{alunoInfo.nome}</Text>
          {alunoInfo.contato ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://wa.me/55${(alunoInfo.contato || '').replace(/\D/g, '')}`)}
                style={{ marginRight: 16 }}
              >
                <Text style={{ color: '#25D366', fontWeight: 'bold' }}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${(alunoInfo.contato || '').replace(/\D/g, '')}`)}
              >
                <Text style={{ color: '#1976D2', fontWeight: 'bold' }}>Ligar</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}
      <Text style={styles.label}>Data</Text>
      <TextInput
        style={[
          styles.input,
          tipoAula === 'RECORRENTE_GERADA' && styles.inputDisabled
        ]}
        placeholder="DD/MM/AAAA"
        value={data}
        onChangeText={t => setData(maskDate(t))}
        maxLength={10}
        editable={tipoAula !== 'RECORRENTE_GERADA'}
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
          style={[styles.tipoBtn, tipoAula === 'RECORRENTE_GERADA' && styles.tipoBtnAtivo]}
          onPress={() => setTipoAula('RECORRENTE_GERADA')}
        >
          <Text style={tipoAula === 'RECORRENTE_GERADA' ? { color: '#fff' } : {}}>Recorrente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoBtn, tipoAula === 'EXCECAO_HORARIO' && styles.tipoBtnAtivo]}
          onPress={() => setTipoAula('EXCECAO_HORARIO')}
        >
          <Text style={tipoAula === 'EXCECAO_HORARIO' ? { color: '#fff' } : {}}>Exceção</Text>
        </TouchableOpacity>
      </View>

      <Button title="Salvar" onPress={handleSalvar} color="#2196F3" />
    </View>
  );
}

// Helper fake
function aulaLinkCheck(a: any, id: any) { return true; }

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