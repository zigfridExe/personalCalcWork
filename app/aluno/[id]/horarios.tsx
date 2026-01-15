import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAulasStore from '../../../store/useAulasStore';
import { AulaCalendario, RegraRecorrencia } from '../../../utils/novoCalendarioUtils';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme } from '@/styles/theme';

export default function HorariosAlunoScreen() {
  const { id } = useLocalSearchParams();
  const alunoId = Number(id);
  const { obterAulasDoAluno, listarRegrasAtivas, encerrarRegraRecorrente } = useAulasStore();
  const [loading, setLoading] = useState(true);
  const [listaAulas, setListaAulas] = useState<AulaCalendario[]>([]);
  const [regrasAtivas, setRegrasAtivas] = useState<RegraRecorrencia[]>([]);

  // Range para histórico e previsões
  const hoje = new Date();
  const inicioHistorico = new Date(hoje.getFullYear() - 1, 0, 1); // 1 ano atrás
  const fimPrevisao = new Date(hoje.getFullYear() + 1, 11, 31); // 1 ano à frente

  // Função para formatar data para DD-MM-AAAA
  function formatarDataBR(dataISO: string) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function getNomeDia(dia: number) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia] || 'Dia Inválido';
  }

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (!alunoId) return;
      const [aulas, regras] = await Promise.all([
        obterAulasDoAluno(alunoId, inicioHistorico, fimPrevisao),
        listarRegrasAtivas(alunoId)
      ]);
      setListaAulas(aulas);
      setRegrasAtivas(regras);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [alunoId]);

  const handleExcluirRegra = (regraId: number) => {
    Alert.alert(
      "Excluir Recorrência",
      "Deseja encerrar esta regra recorrente? As aulas futuras não serão mais geradas, mas o histórico será mantido.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await encerrarRegraRecorrente(regraId);
              Alert.alert("Sucesso", "Regra encerrada.");
              carregarDados(); // Recarrega tudo
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir regra.");
            }
          }
        }
      ]
    );
  };

  // Aulas Futuras (a partir de hoje)
  const aulasAtivas = useMemo(() => {
    const hojeStr = hoje.toISOString().slice(0, 10);
    return listaAulas
      .filter(a => a.data >= hojeStr && a.status !== 'CANCELADA')
      .slice(0, 15); // Próximas 15 aulas
  }, [listaAulas]);

  // Histórico (passado)
  const aulasHistorico = useMemo(() => {
    const hojeStr = hoje.toISOString().slice(0, 10);
    return listaAulas
      .filter(a => a.data < hojeStr)
      .sort((a, b) => b.data.localeCompare(a.data) || b.hora.localeCompare(a.hora)); // Decrescente
  }, [listaAulas]);

  // Resumo Anual
  const resumo = useMemo(() => {
    const ano = hoje.getFullYear();
    const aulasAno = listaAulas.filter(a => a.data.startsWith(`${ano}-`));
    return {
      presencas: aulasAno.filter(a => a.status === 'REALIZADA').length,
      faltas: aulasAno.filter(a => a.status === 'FALTA').length,
      canceladas: aulasAno.filter(a => a.status === 'CANCELADA').length,
      total: aulasAno.length,
    };
  }, [listaAulas, hoje]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <>
      <ScreenHeader title="Horários do Aluno" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {regrasAtivas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Regras de Recorrência (Ativas)</Text>
            {regrasAtivas.map(regra => (
              <View key={regra.id} style={styles.cardRegra}>
                <View>
                  <Text style={styles.regraDia}>{getNomeDia(regra.dia_semana)} às {regra.hora_inicio}</Text>
                  <Text style={styles.regraDetalhe}>{regra.duracao_minutos} min • Início: {formatarDataBR(regra.data_inicio_vigencia)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleExcluirRegra(regra.id)} style={styles.btnTrash}>
                  <Ionicons name="trash-outline" size={24} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Próximas Aulas</Text>
        {aulasAtivas.length === 0 ? <Text style={styles.empty}>Nenhuma aula futura agendada.</Text> : aulasAtivas.map(a => (
          <View key={a.key} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={styles.cardText}>{formatarDataBR(a.data)} às {a.hora}</Text>
            </View>
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>{a.status}</Text>
            {a.observacoes && <Text style={styles.obsText}>{a.observacoes}</Text>}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Histórico Completo</Text>
        {aulasHistorico.length === 0 ? <Text style={styles.empty}>Nenhuma aula no histórico.</Text> : aulasHistorico.map(a => (
          <View key={a.key} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={styles.cardText}>{formatarDataBR(a.data)} às {a.hora}</Text>
            </View>
            <Text style={[styles.statusText, {
              color: a.status === 'REALIZADA' ? theme.colors.success :
                a.status === 'FALTA' ? theme.colors.danger : theme.colors.textSecondary
            }]}>
              {a.status}
            </Text>
            {a.observacoes && <Text style={styles.obsText}>{a.observacoes}</Text>}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Resumo Anual ({hoje.getFullYear()})</Text>
        <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }]}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Presenças</Text>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{resumo.presencas}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Faltas</Text>
            <Text style={[styles.statValue, { color: theme.colors.danger }]}>{resumo.faltas}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{resumo.total}</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  cardRegra: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  regraDia: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.text
  },
  regraDetalhe: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    marginTop: 4
  },
  btnTrash: {
    padding: 8
  },
  empty: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
    fontFamily: theme.fonts.regular
  },
  cardText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 16
  },
  statusText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    marginTop: 4,
    textTransform: 'uppercase'
  },
  obsText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic'
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
    minWidth: 80
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold'
  }
});
