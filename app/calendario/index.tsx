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
    id?: number;
    aluno_id: number;
    aluno_nome?: string;
    data_aula: string;
    hora_inicio: string;
    duracao_minutos: number;
    tipo_aula: string;
    presenca: number;
    observacoes?: string;
    horario_recorrente_id?: number | null;
  };

  const { aulas, carregarAulas, adicionarAula, marcarPresenca, excluirAula } = useAulasStore();
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [modalAula, setModalAula] = useState<Aula | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPresencaId, setModalPresencaId] = useState<number | null>(null);
  const [modalPresencaVisible, setModalPresencaVisible] = useState(false);

  // Marca os dias com aulas
  const markedDates = useMemo(() => {
    const acc: Record<string, any> = {};
    aulas.forEach(aula => {
      acc[aula.data_aula] = {
        marked: true,
        dotColor:
          aula.tipo_aula === 'RECORRENTE_GERADA' ? '#1976D2' :
          aula.tipo_aula === 'AVULSA' ? '#4CAF50' :
          aula.tipo_aula === 'EXCECAO_HORARIO' ? '#FF9800' :
          aula.tipo_aula === 'EXCECAO_CANCELAMENTO' ? '#F44336' : '#888',
        selected: aula.data_aula === dataSelecionada,
        selectedColor: aula.data_aula === dataSelecionada ? '#1976D2' : undefined,
      };
    });
    return acc;
  }, [aulas, dataSelecionada]);

  // Filtra aulas do dia selecionado
  const aulasDoDia = aulas.filter(a => a.data_aula === dataSelecionada);

  // Função para marcar presença
  async function marcarPresencaAula(aula: Aula, presenca: number) {
    if (!aula.id) return;
    await marcarPresenca(aula.id, presenca);
    Alert.alert('Presença atualizada!');
  }

  // Função para apagar aula
  async function apagarAula(aula: Aula) {
    if (!aula.id) return;
    await excluirAula(aula.id);
    Alert.alert('Aula apagada!');
  }

  useEffect(() => {
    setLoading(true);
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    carregarAulas(inicio.toISOString().slice(0, 10), fim.toISOString().slice(0, 10)).then(() => setLoading(false));
  }, [carregarAulas]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário de Aulas</Text>
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
          renderItem={({ item }) => (
            <View style={styles.aulaCard}>
              <Text style={styles.aulaHora}><Text style={{fontWeight:'bold'}}>Horário:</Text> {item.hora_inicio} ({item.duracao_minutos}min)</Text>
              <Text style={styles.aulaAluno}><Text style={{fontWeight:'bold'}}>Aluno:</Text> {item.aluno_nome || 'Aluno'}</Text>
              <Text style={styles.aulaTipo}><Text style={{fontWeight:'bold'}}>Tipo:</Text> {item.tipo_aula}</Text>
              <Text style={styles.aulaStatus}><Text style={{fontWeight:'bold'}}>Status:</Text> {item.presenca === 1 ? 'Presente' : item.presenca === 2 ? 'Faltou' : item.presenca === 3 ? 'Cancelada' : 'Agendada'}</Text>
              {item.observacoes ? <Text style={styles.aulaObs}><Text style={{fontWeight:'bold'}}>Observações:</Text> {item.observacoes}</Text> : null}
              <View style={styles.aulaButtons}>
                <Button title="Presença" color="#4CAF50" onPress={() => marcarPresencaAula(item, 1)} />
                <Button title="Falta" color="#FF9800" onPress={() => marcarPresencaAula(item, 2)} />
                <Button title="Cancelar" color="#F44336" onPress={() => marcarPresencaAula(item, 3)} />
                <Button title="Apagar" color="#B71C1C" onPress={() => apagarAula(item)} />
              </View>
            </View>
          )}
          style={{ width: '100%' }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma aula agendada.</Text>}
        />
      )}
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