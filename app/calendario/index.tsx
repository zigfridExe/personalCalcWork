import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Button, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Link } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';

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
  };

  const { aulas, carregarAulas } = useAulasStore();
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState<boolean>(true);

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

  // Gera lista mesclada de aulas (banco + recorrentes)
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const aulasComRecorrentes = useMemo(() =>
    aulas, // Retorna apenas as aulas do banco
    [aulas]
  );

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
            return (
              <View style={styles.aulaCard}>
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
                  </View>
                )}
              </View>
            );
          }}
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