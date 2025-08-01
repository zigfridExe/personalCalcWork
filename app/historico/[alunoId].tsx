import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import useHistoricoStore from '../../store/useHistoricoStore';
import useAlunosStore from '../../store/useAlunosStore';
// Remover useExerciciosStore

export const options = {
  title: 'Histórico do Aluno'
}

interface HistoricoDetalhado {
  id: number;
  data_inicio: string;
  data_fim: string;
  duracao_minutos: number;
  ficha_nome: string;
  exercicios: Array<{
    nome: string;
    series: Array<{
      serie_numero: number;
      repeticoes: string;
      carga: string;
      observacoes?: string;
    }>;
  }>;
}

export default function HistoricoScreen() {
  const { alunoId } = useLocalSearchParams();
  const router = useRouter();
  
  const { loadHistoricoByAluno, historicos } = useHistoricoStore();
  const { alunos, initializeDatabase, buscarMedidas } = useAlunosStore();

  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historicoMedidas, setHistoricoMedidas] = useState<any[]>([]);

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

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    let detalhes = `Data: ${formatarData(historico.treino.data_inicio)}\n` +
      `Duração: ${formatarDuracao(historico.treino.duracao_minutos)}\n` +
      `Ficha: ${historico.treino.ficha_id}\n\n` +
      `Exercícios realizados:\n`;
    detalhes += exercicios.map((ex: { nome: string; series: any[] }) => {
      return `• ${ex.nome}:\n` +
        ex.series.map((serie: any, idx: number) =>
          `   Série ${serie.serie_numero || idx + 1}: ${serie.repeticoes} reps | ${serie.carga}kg${serie.tempo_cadencia ? ' | Cadência: ' + serie.tempo_cadencia + 's' : ''}`
        ).join('\n');
    }).join('\n');
    Alert.alert(
      'Detalhes do Treino',
      detalhes,
      [{ text: 'OK' }]
    );
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Histórico Completo</Text>
        <Text style={styles.subtitle}>{aluno.nome}</Text>
      </View>
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
                    {formatarData(historicos[0].treino.data_inicio)}
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
                        {formatarData(historico.treino.data_inicio)}
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
                        <Text style={styles.detalhesButtonText}>Detalhes</Text>
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
                <Text style={styles.medidaData}>{medida.data}</Text>
                <Text style={styles.medidaInfo}>Peso: {medida.peso} kg | Altura: {medida.altura} cm | IMC: {calcularIMC(medida.peso, medida.altura)?.toFixed(2)}</Text>
                {medida.cintura && <Text style={styles.medidaInfo}>Cintura: {medida.cintura} cm</Text>}
                {medida.quadril && <Text style={styles.medidaInfo}>Quadril: {medida.quadril} cm</Text>}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#f44336',
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
    color: '#333',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  resumoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resumoCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resumoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  listaSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  treinoCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  treinoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treinoData: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  treinoDuracao: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  treinoFicha: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 8,
  },
  treinoStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  treinoStatsText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  treinoExercicios: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  exercicioItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  medidasSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  medidaCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  medidaData: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 2,
  },
  medidaInfo: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 20,
  },
  detalhesButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  detalhesButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 