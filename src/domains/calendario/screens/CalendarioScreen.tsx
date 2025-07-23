import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useAulasStore from '../../store/useAulasStore';
import { gerarAulasRecorrentesParaPeriodo } from '../../utils/recorrenciaUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AulaCard from '../../components/AulaCard';
import { migrarHorariosRecorrentes } from '../../utils/databaseUtils';
import calendarioStyles from '../../styles/calendarioStyles';

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
    <View style={calendarioStyles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={day => setDataSelecionada(day.dateString)}
        current={dataSelecionada}
        theme={{
          todayTextColor: '#1976D2',
          selectedDayBackgroundColor: '#1976D2',
          arrowColor: '#1976D2',
        }}
      />
      <Text style={calendarioStyles.subtitle}>Aulas do dia {formatarDataBR(dataSelecionada)}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" />
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
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 16 }}>Nenhuma aula para este dia.</Text>}
        />
      )}
    </View>
  );
}
