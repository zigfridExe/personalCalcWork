
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Link, useFocusEffect } from 'expo-router';
import useAulasStore from '../../store/useAulasStore';
import { migrarParaNovoModeloCalendario, initializeDatabase } from '../../utils/databaseUtils';
import AulaCard from '../../components/AulaCard';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme } from '@/styles/theme';

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
  const { aulasVisuais, carregarCalendario, confirmarAula, cancelarAula } = useAulasStore();
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [migrated, setMigrated] = useState(false);

  // Inicialização e Migração
  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        if (!migrated) {
          await migrarParaNovoModeloCalendario();
          setMigrated(true);
        }
      } catch (e) {
        console.error('Erro ao inicializar calendario:', e);
      }
    }
    init();
  }, [migrated]);

  // Carregar aulas ao focar na tela ou mudar o mês
  // Por enquanto, carrega o mês da data selecionada
  useFocusEffect(
    React.useCallback(() => {
      const carregar = async () => {
        setLoading(true);
        try {
          const [ano, mes] = dataSelecionada.split('-').map(Number);
          await carregarCalendario(mes, ano);
        } catch (e) {
          console.error("Erro ao carregar calendário:", e);
        } finally {
          setLoading(false);
        }
      };
      carregar();
    }, [carregarCalendario, dataSelecionada]) // Recarrega se mudar a data (pode ser outro mês)
  );

  // Derivar marcadores do calendário
  const markedDates = useMemo(() => {
    const acc: Record<string, any> = {};
    aulasVisuais.forEach(aula => {
      // Prioridade de cor:
      // Cancelada/Falta = Vermelho/Cinza
      // Realizada = Verde
      // Virtual = Azul
      // Concreta (Agendada) = Verde Claro

      let cor = theme.colors.info; // Virtual padrão
      if (aula.status === 'CANCELADA') cor = theme.colors.danger;
      else if (aula.status === 'FALTA') cor = theme.colors.textSecondary;
      else if (aula.status === 'REALIZADA') cor = theme.colors.success;
      else if (aula.tipo === 'CONCRETA') cor = theme.colors.primary;

      acc[aula.data] = {
        marked: true,
        dotColor: cor,
        selected: aula.data === dataSelecionada,
        selectedColor: aula.data === dataSelecionada ? theme.colors.primary : undefined,
        selectedTextColor: aula.data === dataSelecionada ? theme.colors.background : undefined,
      };
    });

    // Garante que o dia selecionado sempre tenha o círculo de seleção, mesmo sem aula
    if (!acc[dataSelecionada]) {
      acc[dataSelecionada] = {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: theme.colors.background,
      };
    }

    return acc;
  }, [aulasVisuais, dataSelecionada]);

  // Filtrar aulas apenas do dia selecionado
  const aulasDoDia = useMemo(() => {
    return aulasVisuais.filter(a => a.data === dataSelecionada);
  }, [aulasVisuais, dataSelecionada]);

  const handleConfirmar = async (aula: any) => {
    Alert.alert("Confirmar Aula", "Marcar como realizada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => confirmarAula(aula) }
    ]);
  };

  const handleCancelar = async (aula: any) => {
    Alert.alert("Cancelar Aula", "Deseja cancelar esta aula?", [
      { text: "Não", style: "cancel" },
      { text: "Sim, Cancelar", style: "destructive", onPress: () => cancelarAula(aula) }
    ]);
  };

  return (
    <>
      <ScreenHeader title="Calendário" />

      <View style={styles.container}>
        {/* Botões de Ação Rápida */}

        <View style={styles.actionContainer}>
          <Link href="/calendario/nova-recorrente" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>+ Regra Recorrente</Text>
            </TouchableOpacity>
          </Link>
          <View style={{ width: 10 }} />
          <Link href="/calendario/nova" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>+ Aula Avulsa</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Calendar
          current={dataSelecionada}
          markedDates={markedDates}
          onDayPress={day => setDataSelecionada(day.dateString)}
          onMonthChange={month => {
            // Ao mudar o mês no calendário, atualiza a seleção para o dia 1 daquele mês para disparar o carregamento
            setDataSelecionada(month.dateString);
          }}
          enableSwipeMonths
          theme={{
            calendarBackground: theme.colors.card, // Fundo do calendario
            textSectionTitleColor: theme.colors.primary, // Cor dos dias da semana
            todayTextColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.background,
            dotColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.text,
            dayTextColor: theme.colors.text,
            textDisabledColor: theme.colors.textSecondary,
            textMonthFontFamily: theme.fonts.title,
            textDayHeaderFontFamily: theme.fonts.secondary,
            textDayFontFamily: theme.fonts.regular,
          }}
        />

        <View style={styles.listContainer}>
          <Text style={styles.subtitle}>
            {aulasDoDia.length > 0
              ? `Aulas em ${formatarDataBR(dataSelecionada)}`
              : `Nenhuma aula em ${formatarDataBR(dataSelecionada)}`}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={aulasDoDia}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <AulaCard
                  aula={{
                    ...item,
                    // Adaptação para o componente antigo se necessário, ou atualizar o componente
                    id: item.id || 0, // Fallback p/ evitar crash
                    aluno_id: item.aluno_id,
                    data_aula: item.data,
                    hora_inicio: item.hora,
                    duracao_minutos: item.duracao,
                    tipo_aula: item.tipo === 'VIRTUAL' ? 'RECORRENTE_GERADA' : 'AVULSA', // Mock para compatibilidade visual
                    presenca: item.status === 'REALIZADA' ? 1 : item.status === 'CANCELADA' ? 3 : 0
                  }}
                  onMarcarPresenca={() => handleConfirmar(item)}
                  onApagar={() => handleCancelar(item)}
                />
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Dia livre.</Text>}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: theme.colors.card,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContainer: {
    flex: 1,
    padding: 10,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
    fontSize: 14,
    textTransform: 'uppercase',
  }
});
