import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Button, Alert, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Link, router } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import { RRule, rrulestr } from 'rrule';

// Configuração do calendário para português
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ],
  dayNamesShort: [
    'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
  ],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

// Funções utilitárias fora do componente
function formatarDataBR(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function getDiaSemana(dataISO: string) {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const [ano, mes, dia] = dataISO.split('-');
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  return dias[data.getDay()];
}

export default function CalendarioScreen() {
  // Tipos auxiliares para robustez
  type Aula = {
    id?: number | string;
    aluno_id: number;
    aluno_nome?: string;
    data_aula: string;
    hora_inicio: string;
    duracao_minutos: number;
    tipo_aula: string;
    presenca: number;
    observacoes?: string;
    rrule?: string; // Adicionado para aulas recorrentes
  };

  const { aulas, carregarAulas, adicionarAula, marcarPresenca } = useAulasStore();
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [modalAula, setModalAula] = useState<Aula | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPresencaId, setModalPresencaId] = useState<number | null>(null);
  const [modalPresencaVisible, setModalPresencaVisible] = useState(false);

  // Carrega aulas do mês atual ao focar na tela
  useEffect(() => {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    setLoading(true);
    (async () => {
      try {
        await carregarAulas(
          inicio.toISOString().slice(0, 10),
          fim.toISOString().slice(0, 10)
        );
      } catch (error: any) {
        Alert.alert('Erro ao carregar aulas', error?.message || String(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [carregarAulas]);

  // Gera lista mesclada de aulas (banco + recorrentes dinâmicas)
  const aulasComRecorrentes = useMemo(() => {
    // Separar aulas recorrentes (com RRULE) e exceções
    const recorrentes = aulas.filter(a => a.tipo_aula === 'RECORRENTE' && a.rrule);
    const avulsas = aulas.filter(a => a.tipo_aula === 'AVULSA');
    const sobrescritas = aulas.filter(a => a.tipo_aula === 'SOBREESCRITA');
    const canceladas = aulas.filter(a => a.tipo_aula === 'CANCELADA_RECORRENTE');

    // Período do mês atual
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const inicio = new Date(ano, mes, 1);
    const fim = new Date(ano, mes + 1, 0);

    // Gerar ocorrências recorrentes do mês
    let ocorrencias: Aula[] = [];
    for (const rec of recorrentes) {
      try {
        const rule = rrulestr(rec.rrule!);
        const datas = rule.between(inicio, fim, true);
        for (const dataObj of datas) {
          const dataStr = dataObj.toISOString().slice(0, 10);
          // Verifica se existe sobrescrita/cancelada/avulsa para esse dia/aluno/hora
          const sobrescrita = sobrescritas.find(s => s.aluno_id === rec.aluno_id && s.data_aula === dataStr && s.hora_inicio === rec.hora_inicio);
          const cancelada = canceladas.find(c => c.aluno_id === rec.aluno_id && c.data_aula === dataStr && c.hora_inicio === rec.hora_inicio);
          const avulsa = avulsas.find(a => a.aluno_id === rec.aluno_id && a.data_aula === dataStr && a.hora_inicio === rec.hora_inicio);
          if (!sobrescrita && !cancelada && !avulsa) {
            ocorrencias.push({
              ...rec,
              id: `recorrente_${rec.aluno_id}_${dataStr}_${rec.hora_inicio}`,
              data_aula: dataStr,
            });
          }
        }
      } catch (e) {
        // Se a RRULE estiver inválida, ignora
      }
    }
    // Junta todas as aulas: avulsas, sobrescritas, canceladas e recorrentes geradas
    return [
      ...ocorrencias,
      ...avulsas,
      ...sobrescritas,
      ...canceladas,
    ];
  }, [aulas]);

  // Marca os dias com aulas (usando a lista mesclada)
  const markedDates = aulasComRecorrentes.reduce((acc, aula) => {
    acc[aula.data_aula] = {
      marked: true,
      dotColor:
        aula.tipo_aula === 'RECORRENTE' ? '#1976D2' :
        aula.tipo_aula === 'AVULSA' ? '#4CAF50' :
        aula.tipo_aula === 'SOBREESCRITA' ? '#FF9800' :
        aula.tipo_aula === 'CANCELADA_RECORRENTE' ? '#F44336' : '#888',
      selected: aula.data_aula === dataSelecionada,
      selectedColor: aula.data_aula === dataSelecionada ? '#1976D2' : undefined,
    };
    return acc;
  }, {} as Record<string, any>);

  // Filtra aulas do dia selecionado (usando a lista mesclada)
  const aulasDoDia = aulasComRecorrentes.filter(a => a.data_aula === dataSelecionada);

  // Função para abrir o modal de opções de aula recorrente
  function handleAulaPress(aula: Aula) {
    if (typeof aula.id === 'string' && aula.id.startsWith('recorrente_')) {
      setModalAula(aula);
      setModalVisible(true);
    }
  }

  // Função para fechar o modal
  function fecharModal() {
    setModalVisible(false);
    setModalAula(null);
  }

  // Função para editar só esta ocorrência (cria sobrescrita)
  async function editarOcorrencia() {
    if (!modalAula) return;
    fecharModal();
    try {
      await adicionarAula({
        aluno_id: modalAula.aluno_id,
        data_aula: modalAula.data_aula,
        hora_inicio: modalAula.hora_inicio,
        duracao_minutos: modalAula.duracao_minutos,
        presenca: 0,
        observacoes: modalAula.observacoes || '',
        tipo_aula: 'SOBREESCRITA',
        horario_recorrente_id: null,
        rrule: undefined,
        data_avulsa: modalAula.data_aula,
        sobrescrita_id: undefined,
        cancelada_por_id: undefined,
      });
      await carregarAulas();
      Alert.alert('Sucesso', 'Ocorrência sobrescrita criada! Agora edite normalmente.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível sobrescrever esta ocorrência.');
    }
  }

  // Função para editar toda a recorrência
  function editarRecorrencia() {
    if (!modalAula) return;
    fecharModal();
    // Encontrar o id real da recorrência (pelo aluno_id, hora_inicio e rrule)
    const rec = aulas.find(a => a.tipo_aula === 'RECORRENTE' && a.aluno_id === modalAula.aluno_id && a.hora_inicio === modalAula.hora_inicio && a.rrule === modalAula.rrule);
    if (rec && typeof rec.id === 'number') {
      // Redireciona para a tela de edição da recorrência
      // /calendario/editar?id=rec.id
      router.push(`/calendario/editar?id=${rec.id}`);
    } else {
      Alert.alert('Recorrência não encontrada', 'Não foi possível localizar a configuração da recorrência.');
    }
  }

  // Função para cancelar só esta ocorrência (cria registro de cancelamento)
  async function cancelarOcorrencia() {
    if (!modalAula) return;
    fecharModal();
    try {
      await adicionarAula({
        aluno_id: modalAula.aluno_id,
        data_aula: modalAula.data_aula,
        hora_inicio: modalAula.hora_inicio,
        duracao_minutos: modalAula.duracao_minutos,
        presenca: 3, // 3 = Cancelada
        observacoes: 'Cancelada individualmente',
        tipo_aula: 'CANCELADA_RECORRENTE',
        horario_recorrente_id: null,
        rrule: undefined,
        data_avulsa: modalAula.data_aula,
        sobrescrita_id: undefined,
        cancelada_por_id: undefined,
      });
      await carregarAulas();
      Alert.alert('Sucesso', 'Ocorrência cancelada!');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível cancelar esta ocorrência.');
    }
  }

  // Função para cancelar toda a recorrência
  async function cancelarRecorrencia() {
    fecharModal();
    if (!modalAula) return;
    // Encontrar o registro da recorrência original
    const rec = aulas.find(a => a.tipo_aula === 'RECORRENTE' && a.aluno_id === modalAula.aluno_id && a.hora_inicio === modalAula.hora_inicio && a.rrule === modalAula.rrule);
    if (rec && typeof rec.id === 'number') {
      try {
        await adicionarAula({
          aluno_id: rec.aluno_id,
          data_aula: rec.data_aula, // data de início da recorrência
          hora_inicio: rec.hora_inicio,
          duracao_minutos: rec.duracao_minutos,
          presenca: 3, // Cancelada
          observacoes: 'Recorrência cancelada',
          tipo_aula: 'CANCELADA_RECORRENTE',
          horario_recorrente_id: null,
          rrule: rec.rrule,
          data_avulsa: undefined,
          sobrescrita_id: undefined,
          cancelada_por_id: undefined,
        });
        await carregarAulas();
        Alert.alert('Sucesso', 'Toda a recorrência foi cancelada e o calendário atualizado!');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível cancelar a recorrência.');
      }
    } else {
      Alert.alert('Recorrência não encontrada', 'Não foi possível localizar a configuração da recorrência.');
    }
  }

  function abrirModalPresenca(id: number) {
    setModalPresencaId(id);
    setModalPresencaVisible(true);
  }
  function fecharModalPresenca() {
    setModalPresencaId(null);
    setModalPresencaVisible(false);
  }
  async function definirPresenca(presenca: number) {
    if (modalPresencaId == null) return;
    fecharModalPresenca();
    try {
      await marcarPresenca(modalPresencaId, presenca);
      await carregarAulas();
      let msg = '';
      if (presenca === 1) msg = 'Presença marcada: aluno presente!';
      else if (presenca === 2) msg = 'Falta marcada: aluno faltou sem avisar.';
      else if (presenca === 3) msg = 'Cancelada: aluno avisou que não viria.';
      Alert.alert('Sucesso', msg);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível marcar presença.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário de Aulas</Text>
      
      {/* Botões de ação */}
      <View style={styles.actionButtons}>
        <Link href="/calendario/nova" asChild>
          <Button title="➕ Nova Aula" color="#4CAF50" />
        </Link>
      </View>
      
      <Calendar
        markedDates={markedDates}
        onDayPress={day => setDataSelecionada(day.dateString)}
        enableSwipeMonths
        theme={{
          todayTextColor: '#1976D2',
          selectedDayBackgroundColor: '#1976D2',
          dotColor: '#1976D2',
        }}
      />
      <Text style={styles.subtitle}>
        {aulasDoDia.length > 0
          ? `Aulas em ${formatarDataBR(dataSelecionada)}`
          : `Nenhuma aula em ${formatarDataBR(dataSelecionada)}`}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={aulasDoDia}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => {
            const isRecorrenteVirtual = typeof item.id === 'string' && item.id.startsWith('recorrente_');
            return (
              <TouchableOpacity
                activeOpacity={isRecorrenteVirtual ? 0.7 : 1}
                onPress={() => isRecorrenteVirtual ? handleAulaPress(item) : undefined}
                style={styles.aulaCard}
              >
                <Text style={styles.aulaHora}>{item.hora_inicio} ({item.duracao_minutos}min)</Text>
                <Text style={styles.aulaAluno}>
                  {item.aluno_nome || 'Aluno'}
                  {'  '}
                  <Text style={styles.diaSemana}>({getDiaSemana(item.data_aula)})</Text>
                </Text>
                <Text style={styles.aulaTipo}>
                  {item.tipo_aula === 'RECORRENTE' && 'Recorrente'}
                  {item.tipo_aula === 'AVULSA' && 'Avulsa'}
                  {item.tipo_aula === 'SOBREESCRITA' && 'Sobreescrita'}
                  {item.tipo_aula === 'CANCELADA_RECORRENTE' && 'Cancelada'}
                </Text>
                <Text style={styles.aulaStatus}>
                  {item.presenca === 1 && 'Presente'}
                  {item.presenca === 2 && 'Faltou'}
                  {item.presenca === 3 && 'Cancelada'}
                  {item.presenca === 0 && 'Agendada'}
                </Text>
                {item.observacoes ? <Text style={styles.aulaObs}>{item.observacoes}</Text> : null}
                {/* Botões de ação para cada aula */}
                {typeof item.id === 'number' && (
                  <View style={styles.aulaButtons}>
                    <Link href={`/calendario/editar?id=${item.id}`} asChild>
                      <Button title="✏️ Editar" color="#2196F3" />
                    </Link>
                    <Button title="Presença" color="#4CAF50" onPress={() => abrirModalPresenca(item.id as number)} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          style={{ width: '100%' }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma aula agendada.</Text>}
        />
      )}
      {/* Modal de opções para aula recorrente */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 24, minWidth: 260, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Aula Recorrente</Text>
            <Text style={{ marginBottom: 16 }}>O que deseja fazer?</Text>
            <Button title="✏️ Editar apenas esta ocorrência" onPress={editarOcorrencia} color="#FF9800" />
            <View style={{ height: 10 }} />
            <Button title="✏️ Editar toda a recorrência" onPress={editarRecorrencia} color="#1976D2" />
            <View style={{ height: 10 }} />
            <Button title="❌ Cancelar apenas esta ocorrência" onPress={cancelarOcorrencia} color="#F44336" />
            <View style={{ height: 10 }} />
            <Button title="❌ Cancelar toda a recorrência" onPress={cancelarRecorrencia} color="#B71C1C" />
            <View style={{ height: 20 }} />
            <Button title="Fechar" onPress={fecharModal} color="#888" />
          </View>
        </View>
      </Modal>
      {/* Modal de presença */}
      <Modal
        visible={modalPresencaVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharModalPresenca}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 24, minWidth: 260, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Marcar Presença</Text>
            <Button title="Presente (aluno veio)" color="#4CAF50" onPress={() => definirPresenca(1)} />
            <View style={{ height: 10 }} />
            <Button title="Cancelada (aluno avisou)" color="#F44336" onPress={() => definirPresenca(3)} />
            <View style={{ height: 10 }} />
            <Button title="Falta (não avisou)" color="#FF9800" onPress={() => definirPresenca(2)} />
            <View style={{ height: 20 }} />
            <Button title="Fechar" onPress={fecharModalPresenca} color="#888" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#1976D2',
    marginVertical: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  aulaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  aulaHora: {
    fontWeight: 'bold',
    color: '#1976D2',
    fontSize: 16,
  },
  aulaAluno: {
    fontSize: 15,
    color: '#333',
  },
  aulaTipo: {
    fontSize: 13,
    color: '#888',
  },
  aulaStatus: {
    fontSize: 13,
    color: '#4CAF50',
  },
  aulaObs: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  aulaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  diaSemana: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  diaSemanaRecorrente: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
  },
});