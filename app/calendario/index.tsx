import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Link, useFocusEffect } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import { gerarAulasRecorrentesParaPeriodo } from '../../utils/recorrenciaUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AulaCard from '../../components/AulaCard';
import { migrarHorariosRecorrentes } from '../../utils/databaseUtils';

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

function formatarDataBR(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function CalendarioScreen() {
  const { aulas, carregarAulas, marcarPresenca, excluirAula } = useAulasStore();
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Marcação dos dias com aulas
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

  // Exibe apenas uma aula por aluno/hora, priorizando exceções/cancelamentos
  const aulasDoDia = useMemo(() => {
    const aulasDia = aulas.filter(a => a.data_aula === dataSelecionada);
    const key = (a: any) => `${a.aluno_id}_${a.hora_inicio}`;
    const map = new Map<string, any>();
    for (const aula of aulasDia) {
      const k = key(aula);
      if (map.has(k)) continue;
      if (aula.tipo_aula === 'EXCECAO_HORARIO' || aula.tipo_aula === 'EXCECAO_CANCELAMENTO') {
        map.set(k, aula);
      } else if (aula.tipo_aula === 'RECORRENTE_GERADA') {
        if (!map.has(k)) map.set(k, aula);
      } else {
        map.set(k, aula);
      }
    }
    return Array.from(map.values());
  }, [aulas, dataSelecionada]);

  // Marcar presença/falta/cancelamento
  async function marcarPresencaAula(aula: any, presenca: number) {
    if (!aula.id) return;
    await marcarPresenca(aula.id, presenca);
  }

  // Apagar aula
  async function apagarAula(aula: any) {
    if (!aula.id) return;
    await excluirAula(aula.id);
  }

  // Geração automática de recorrentes conforme look-ahead
  useFocusEffect(
    React.useCallback(() => {
      migrarHorariosRecorrentes();
      setLoading(true);
      const gerarComLookAhead = async () => {
        try {
          const hoje = new Date();
          let lookAheadMeses = 1;
          try {
            const val = await AsyncStorage.getItem('lookAheadMeses');
            if (val) lookAheadMeses = Number(val);
          } catch {}
          const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          const fim = new Date(hoje.getFullYear(), hoje.getMonth() + lookAheadMeses, 0);
          await gerarAulasRecorrentesParaPeriodo(inicio.toISOString().slice(0, 10), fim.toISOString().slice(0, 10));
          await carregarAulas(inicio.toISOString().slice(0, 10), fim.toISOString().slice(0, 10));
        } catch (e) {
          console.error('Erro ao carregar aulas:', e);
        } finally {
          setLoading(false);
        }
      };
      gerarComLookAhead();
    }, [carregarAulas])
  );

  return (
    <View style={styles.container}>
      <View style={{ width: '100%', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ width: '95%', backgroundColor: '#fff', borderRadius: 8, padding: 12, alignItems: 'center', elevation: 2, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Nova Aula</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
            <Link href="/calendario/nova" asChild>
              <Button title="+ Avulsa" color="#4CAF50" />
            </Link>
            <Link href="/calendario/nova-recorrente" asChild>
              <Button title="+ Recorrente" color="#1976D2" />
            </Link>
          </View>
        </View>
      </View>
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
            <AulaCard
              aula={item}
              onMarcarPresenca={marcarPresencaAula}
              onApagar={apagarAula}
            />
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
    marginTop: 2,
    marginBottom: 2,
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
});