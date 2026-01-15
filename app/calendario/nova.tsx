
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import useAlunosStore from '../../store/useAlunosStore';
import { Picker } from '@react-native-picker/picker';
import { theme } from '@/styles/theme';
import ScreenHeader from '@/shared/components/ScreenHeader';

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
  const [tipoAula, setTipoAula] = useState<'AVULSA' | 'EXCECAO_HORARIO' | 'EXCECAO_CANCELAMENTO'>('AVULSA');

  const handleSalvar = async () => {
    if (!alunoId || !data || !hora || !duracao) {
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
    <>
      <ScreenHeader title="Nova Aula Avulsa" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.label}>Aluno</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={alunoId}
            onValueChange={itemValue => setAlunoId(itemValue)}
            style={styles.picker}
            dropdownIconColor={theme.colors.text}
            itemStyle={styles.pickerItem}
          >
            {alunos.map(aluno => (
              <Picker.Item key={aluno.id} label={aluno.nome} value={aluno.id} color={theme.colors.background} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Tipo de Aula</Text>
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity
            style={[styles.tipoBtn, tipoAula === 'AVULSA' && styles.tipoBtnAtivo]}
            onPress={() => setTipoAula('AVULSA')}
          >
            <Text style={[styles.tipoBtnText, tipoAula === 'AVULSA' && styles.tipoBtnTextAtivo]}>Avulsa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoBtn, tipoAula === 'EXCECAO_HORARIO' && styles.tipoBtnAtivo]}
            onPress={() => setTipoAula('EXCECAO_HORARIO')}
          >
            <Text style={[styles.tipoBtnText, tipoAula === 'EXCECAO_HORARIO' && styles.tipoBtnTextAtivo]}>Extra</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={theme.colors.textSecondary}
          value={data}
          onChangeText={t => setData(maskDataBR(t))}
          maxLength={10}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Hora</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          placeholderTextColor={theme.colors.textSecondary}
          value={hora}
          onChangeText={t => setHora(formatHora(t))}
          keyboardType="numeric"
          maxLength={5}
        />

        <Text style={styles.label}>Duração (minutos)</Text>
        <TextInput
          style={styles.input}
          placeholder="60"
          placeholderTextColor={theme.colors.textSecondary}
          value={duracao}
          onChangeText={t => setDuracao(t.replace(/\D/g, ''))}
          keyboardType="numeric"
          maxLength={3}
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={styles.input}
          placeholder="Observações da Aula"
          placeholderTextColor={theme.colors.textSecondary}
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>SALVAR AULA</Text>
        </TouchableOpacity>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
  pickerWrapper: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: theme.colors.text,
    height: 55,
  },
  pickerItem: {
    fontSize: 16,
    color: theme.colors.text,
  },
  tipoBtn: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipoBtnAtivo: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tipoBtnText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  tipoBtnTextAtivo: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
    fontSize: 18,
    textTransform: 'uppercase',
  }
});
