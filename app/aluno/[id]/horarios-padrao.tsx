import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHorariosRecorrentesStore, HorarioRecorrente } from '../../../store/useHorariosRecorrentesStore';
import { limparAulasDuplicadas } from '../../../utils/databaseUtils';

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function HorariosPadraoScreen() {
  const { id } = useLocalSearchParams();
  const aluno_id = Number(id);
  const router = useRouter();
  const { horarios, fetchHorarios, addHorario, updateHorario, deactivateHorario, loading } = useHorariosRecorrentesStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<HorarioRecorrente | null>(null);
  const [form, setForm] = useState({
    dia_semana: 1,
    hora_inicio: '08:00',
    duracao_minutos: 60,
    data_inicio_vigencia: '',
    data_fim_vigencia: '',
  });

  useEffect(() => {
    fetchHorarios(aluno_id);
  }, [aluno_id, fetchHorarios]);

  const abrirModal = (horario?: HorarioRecorrente) => {
    if (horario) {
      setEditando(horario);
      setForm({
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        duracao_minutos: horario.duracao_minutos,
        data_inicio_vigencia: horario.data_inicio_vigencia || '',
        data_fim_vigencia: horario.data_fim_vigencia || '',
      });
    } else {
      setEditando(null);
      setForm({ dia_semana: 1, hora_inicio: '08:00', duracao_minutos: 60, data_inicio_vigencia: '', data_fim_vigencia: '' });
    }
    setModalVisible(true);
  };

  // Função para aplicar máscara e validar horário HH:MM
  function formatHora(hora: string) {
    // Remove tudo que não for número
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
  // Funções para datas DD/MM/AAAA <-> YYYY-MM-DD
  function formatDataBR(data: string) {
    if (!data) return '';
    if (data.includes('-')) {
      const [y, m, d] = data.split('-');
      return `${d}/${m}/${y}`;
    }
    return data;
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

  // Função para aplicar máscara de data DD/MM/AAAA
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

  const salvar = async () => {
    if (!form.hora_inicio || !form.duracao_minutos) {
      Alert.alert('Preencha todos os campos obrigatórios!');
      return;
    }
    if (!isHoraValida(form.hora_inicio)) {
      Alert.alert('Horário inválido! Use o formato HH:MM.');
      return;
    }
    if (form.data_inicio_vigencia && !isDataValidaBR(form.data_inicio_vigencia)) {
      Alert.alert('Data de início inválida! Use o formato DD/MM/AAAA.');
      return;
    }
    if (form.data_fim_vigencia && !isDataValidaBR(form.data_fim_vigencia)) {
      Alert.alert('Data de fim inválida! Use o formato DD/MM/AAAA.');
      return;
    }
    if (editando) {
      await updateHorario(editando.id, {
        dia_semana: form.dia_semana,
        hora_inicio: form.hora_inicio,
        duracao_minutos: Number(form.duracao_minutos),
        data_inicio_vigencia: form.data_inicio_vigencia ? formatDataISO(form.data_inicio_vigencia) : null,
        data_fim_vigencia: form.data_fim_vigencia ? formatDataISO(form.data_fim_vigencia) : null,
      });
    } else {
      await addHorario({
        aluno_id,
        dia_semana: form.dia_semana,
        hora_inicio: form.hora_inicio,
        duracao_minutos: Number(form.duracao_minutos),
        data_inicio_vigencia: form.data_inicio_vigencia ? formatDataISO(form.data_inicio_vigencia) : null,
        data_fim_vigencia: form.data_fim_vigencia ? formatDataISO(form.data_fim_vigencia) : null,
      });
    }
    setModalVisible(false);
    fetchHorarios(aluno_id);
  };

  const confirmarDesativar = (id: number) => {
    Alert.alert('Desativar horário', 'Deseja realmente desativar este horário padrão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desativar', style: 'destructive', onPress: async () => { await deactivateHorario(id); fetchHorarios(aluno_id); } },
    ]);
  };

  const limparDuplicacoes = async () => {
    try {
      await limparAulasDuplicadas();
      Alert.alert('Sucesso', 'Aulas duplicadas removidas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao limpar duplicações: ' + error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horários Padrão do Aluno</Text>
      <View style={styles.buttonRow}>
        <Button title="Adicionar Horário Padrão" onPress={() => abrirModal()} color="#2196F3" />
        <Button title="Limpar Duplicações" onPress={limparDuplicacoes} color="#FF9800" />
        <Button title="Editar Aula Manualmente" onPress={() => router.push(`/calendario/editar?id=${aluno_id}`)} color="#4CAF50" />
      </View>
      <FlatList
        data={horarios}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum horário padrão cadastrado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.horarioItem}>
            <Text style={styles.dia}>{diasSemana[item.dia_semana]}</Text>
            <Text style={styles.hora}>{item.hora_inicio} ({item.duracao_minutos} min)</Text>
            {item.data_inicio_vigencia ? <Text style={styles.vigencia}>Início: {item.data_inicio_vigencia}</Text> : null}
            {item.data_fim_vigencia ? <Text style={styles.vigencia}>Fim: {item.data_fim_vigencia}</Text> : null}
            <View style={styles.botoes}>
              <TouchableOpacity onPress={() => abrirModal(item)} style={styles.botaoEditar}>
                <Text style={{ color: '#fff' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmarDesativar(item.id)} style={styles.botaoDesativar}>
                <Text style={{ color: '#fff' }}>Desativar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        style={{ marginTop: 20 }}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editando ? 'Editar' : 'Novo'} Horário Padrão</Text>
            <Text style={styles.label}>Dia da Semana</Text>
            <FlatList
              data={diasSemana}
              horizontal
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.diaBtn, form.dia_semana === index && styles.diaBtnAtivo]}
                  onPress={() => setForm(f => ({ ...f, dia_semana: index }))}
                >
                  <Text style={form.dia_semana === index ? { color: '#fff' } : {}}>{item.slice(0,3)}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(_, i) => String(i)}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.label}>Hora de Início</Text>
            <TextInput
              style={styles.input}
              value={form.hora_inicio}
              onChangeText={t => setForm(f => ({ ...f, hora_inicio: formatHora(t) }))}
              placeholder="HH:MM"
              keyboardType="default"
              maxLength={5}
            />
            <Text style={styles.label}>Duração (minutos)</Text>
            <TextInput
              style={styles.input}
              value={String(form.duracao_minutos)}
              onChangeText={t => setForm(f => ({ ...f, duracao_minutos: Number(t.replace(/\D/g, '')) }))}
              placeholder="60"
              keyboardType="numeric"
              maxLength={3}
            />
                        <Text style={styles.label}>Início Vigência (opcional - deixe vazio para sempre)</Text>
            <TextInput
              style={styles.input}
              value={formatDataBR(form.data_inicio_vigencia)}
              onChangeText={t => setForm(f => ({ ...f, data_inicio_vigencia: maskDataBR(t) }))}
              placeholder="DD/MM/AAAA (deixe vazio para sempre)"
              maxLength={10}
            />
            <Text style={styles.label}>Fim Vigência (opcional - deixe vazio para sempre)</Text>
            <TextInput
              style={styles.input}
              value={formatDataBR(form.data_fim_vigencia)}
              onChangeText={t => setForm(f => ({ ...f, data_fim_vigencia: maskDataBR(t) }))}
              placeholder="DD/MM/AAAA (deixe vazio para sempre)"
              maxLength={10}
            />
            <View style={styles.modalBotoes}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#888" />
              <Button title={editando ? 'Salvar' : 'Adicionar'} onPress={salvar} color="#2196F3" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  empty: { textAlign: 'center', color: '#888', marginTop: 30 },
  horarioItem: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 12, elevation: 2 },
  dia: { fontSize: 16, fontWeight: 'bold', color: '#1976D2' },
  hora: { fontSize: 15, marginBottom: 4 },
  vigencia: { fontSize: 12, color: '#666' },
  botoes: { flexDirection: 'row', marginTop: 8, gap: 8 },
  botaoEditar: { backgroundColor: '#2196F3', borderRadius: 5, padding: 6, marginRight: 8 },
  botaoDesativar: { backgroundColor: '#f44336', borderRadius: 5, padding: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  label: { fontSize: 14, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 4 },
  modalBotoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 10 },
  diaBtn: { padding: 8, borderRadius: 6, backgroundColor: '#eee', marginHorizontal: 2 },
  diaBtnAtivo: { backgroundColor: '#2196F3' },
});