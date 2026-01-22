import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import useHistoricoStore from '../../store/useHistoricoStore';
import useAlunosStore from '../../store/useAlunosStore';
import CustomModal from '../../components/CustomModal';
import { theme } from '@/styles/theme';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import ScreenHeader from '@/shared/components/ScreenHeader';

export default function HistoricoScreen() {
  const { alunoId } = useLocalSearchParams();
  const router = useRouter();

  const { loadHistoricoByAluno, historicos } = useHistoricoStore();
  const { alunos, initializeDatabase, buscarMedidas } = useAlunosStore();

  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historicoMedidas, setHistoricoMedidas] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [detalhesTreino, setDetalhesTreino] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      await initializeDatabase();
      if (alunoId) {
        await loadHistoricoByAluno(Number(alunoId));
        const medidas = await buscarMedidas(Number(alunoId));
        setHistoricoMedidas(medidas);
      }
      setLoading(false);
    };
    initData();
  }, [alunoId, initializeDatabase, loadHistoricoByAluno, buscarMedidas]);

  useEffect(() => {
    // Encontrar o aluno
    const alunoAtual = alunos.find(a => a.id === Number(alunoId));
    setAluno(alunoAtual);
  }, [alunos, alunoId]);

  const formatarDuracao = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // Agrupa as séries por exercício_nome para exibição
  const agruparExercicios = (series: any[]): { nome: string; series: any[] }[] => {
    const agrupado: { [key: string]: any[] } = {};
    for (const serie of series) {
      if (!agrupado[serie.exercicio_nome]) agrupado[serie.exercicio_nome] = [];
      agrupado[serie.exercicio_nome].push(serie);
    }
    return Object.entries(agrupado).map(([nome, series]) => ({ nome, series }));
  };

  const handleVerDetalhes = (historico: any) => {
    const exercicios = agruparExercicios(historico.series);
    setDetalhesTreino({ ...historico, exerciciosAgrupados: exercicios });
    setModalVisible(true);
  };

  const calcularIMC = (peso: number, altura: number) => {
    if (!peso || !altura) return null;
    return peso / Math.pow(altura / 100, 2);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  if (!aluno) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Aluno não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScreenHeader title={`Histórico: ${aluno.nome}`} />
      <ScrollView style={styles.content}>
        {/* Resumo Geral de Treinos */}
        {historicos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>📊</Text>
            <Text style={styles.emptyStateTitle}>Nenhum treino registrado</Text>
            <Text style={styles.emptyStateSubtitle}>
              O histórico de treinos aparecerá aqui quando o aluno realizar treinos.
            </Text>
          </View>
        ) : (
          <>
            {/* Resumo */}
            <View style={styles.resumoSection}>
              <Text style={styles.sectionTitle}>Resumo Geral de Treinos</Text>
              <View style={styles.resumoCard}>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Total de Treinos</Text>
                  <Text style={styles.resumoValue}>{historicos.length}</Text>
                </View>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Tempo Total</Text>
                  <Text style={styles.resumoValue}>
                    {formatarDuracao(
                      historicos.reduce((total, h) => total + h.treino.duracao_minutos, 0)
                    )}
                  </Text>
                </View>
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Último Treino</Text>
                  <Text style={styles.resumoValue}>
                    {formatDateTime(historicos[0].treino.data_inicio)}
                  </Text>
                </View>
              </View>
            </View>
            {/* Lista de Treinos */}
            <View style={styles.listaSection}>
              <Text style={styles.sectionTitle}>Treinos Realizados</Text>
              {historicos.map((historico, index) => {
                const exercicios = agruparExercicios(historico.series);
                return (
                  <TouchableOpacity
                    key={historico.treino.id}
                    style={styles.treinoCard}
                    onPress={() => handleVerDetalhes(historico)}
                  >
                    <View style={styles.treinoHeader}>
                      <Text style={styles.treinoData}>
                        {formatDateTime(historico.treino.data_inicio)}
                      </Text>
                      <Text style={styles.treinoDuracao}>
                        {formatarDuracao(historico.treino.duracao_minutos)}
                      </Text>
                    </View>
                    <Text style={styles.treinoFicha}>Ficha {historico.treino.ficha_id}</Text>
                    <View style={styles.treinoStats}>
                      <Text style={styles.treinoStatsText}>
                        {exercicios.length} exercícios
                      </Text>
                      <Text style={styles.treinoStatsText}>
                        {exercicios.reduce((total: number, ex: { series: any[] }) => total + ex.series.length, 0)} séries
                      </Text>
                    </View>
                    <View style={styles.treinoExercicios}>
                      {exercicios.slice(0, 3).map((exercicio: { nome: string; series: any[] }, idx: number) => (
                        <Text key={idx} style={styles.exercicioItem}>
                          • {exercicio.nome} ({exercicio.series.length} séries)
                        </Text>
                      ))}
                      {exercicios.length > 3 && (
                        <Text style={styles.exercicioItem}>
                          ... e mais {exercicios.length - 3} exercícios
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
                      <TouchableOpacity onPress={() => handleVerDetalhes(historico)} style={styles.detalhesButton}>
                        <Text style={styles.detalhesButtonText}>DETALHES</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
        {/* Histórico de Medidas */}
        <View style={styles.medidasSection}>
          <Text style={styles.sectionTitle}>Histórico de Medidas</Text>
          {historicoMedidas.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum registro de medidas encontrado.</Text>
          ) : (
            historicoMedidas.map((medida, idx) => (
              <View key={idx} style={styles.medidaCard}>
                <Text style={styles.medidaData}>{formatDate(medida.data)}</Text>
                <Text style={styles.medidaInfo}>Peso: {medida.peso} kg | Altura: {medida.altura} cm | IMC: {calcularIMC(medida.peso, medida.altura)?.toFixed(2)}</Text>
                {medida.cintura && <Text style={styles.medidaInfo}>Cintura: {medida.cintura} cm</Text>}
                {medida.quadril && <Text style={styles.medidaInfo}>Quadril: {medida.quadril} cm</Text>}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        title="Detalhes do Treino"
        onClose={() => setModalVisible(false)}
        confirmText="FECHAR"
        type="info"
      >
        {detalhesTreino && (
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalInfo}>📅 {formatDateTime(detalhesTreino.treino.data_inicio)}</Text>
            <Text style={styles.modalInfo}>⏱️ {formatarDuracao(detalhesTreino.treino.duracao_minutos)}</Text>
            <View style={styles.modalDivider} />
            {detalhesTreino.exerciciosAgrupados.map((ex: any, idx: number) => (
              <View key={idx} style={styles.modalExercicio}>
                <Text style={styles.modalExercicioNome}>{ex.nome}</Text>
                {ex.series.map((serie: any, sIdx: number) => (
                  <Text key={sIdx} style={styles.modalSerie}>
                    Série {serie.serie_numero || sIdx + 1}: {serie.repeticoes} reps | {serie.carga}kg
                    {serie.tempo_cadencia > 0 ? ` | ⏱️ ${serie.tempo_cadencia}s` : ''}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  subtitle: {
    fontSize: 20,
    color: theme.colors.primary,
    textAlign: 'center',
    fontFamily: theme.fonts.title,
    marginTop: 5,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: theme.colors.danger,
    fontFamily: theme.fonts.regular,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
    fontFamily: theme.fonts.title,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: theme.fonts.regular,
  },
  resumoSection: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    marginBottom: 15,
    color: theme.colors.primary,
  },
  resumoCard: {
    backgroundColor: theme.colors.background, // Nested darker background for card
    padding: 15,
    borderRadius: theme.borderRadius.sm,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resumoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  resumoValue: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  listaSection: {
    marginBottom: 15,
  },
  treinoCard: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  treinoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treinoData: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  treinoDuracao: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  treinoFicha: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
  },
  treinoStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  treinoStatsText: {
    fontSize: 12,
    color: theme.colors.background,
    backgroundColor: theme.colors.text, // High contrast for badge
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: theme.fonts.regular,
    overflow: 'hidden',
  },
  treinoExercicios: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
  },
  exercicioItem: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontFamily: theme.fonts.regular,
  },
  medidasSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  medidaCard: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  medidaData: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  medidaInfo: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    fontFamily: theme.fonts.regular,
  },
  detalhesButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
  },
  detalhesButtonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.bold,
    fontSize: 12,
  },
  // Modal Styles
  modalScroll: {
    maxHeight: 400,
    width: '100%',
  },
  modalInfo: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 5,
    fontFamily: theme.fonts.bold,
  },
  modalDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 15,
  },
  modalExercicio: {
    marginBottom: 15,
  },
  modalExercicioNome: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  modalSerie: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    marginLeft: 10,
    marginBottom: 2,
  },
}); 