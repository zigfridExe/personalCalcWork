import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import useFichasStore from '../../store/useFichasStore';
import useAlunosStore from '../../store/useAlunosStore';
import useExerciciosStore from '../../store/useExerciciosStore';
import useHistoricoStore from '../../store/useHistoricoStore';
import Cronometro, { CronometroHandle } from '../../components/Cronometro';
import CustomModal from '../../components/CustomModal';
import { getDatabase } from '../../utils/databaseUtils';
import { theme } from '../../src/styles/theme';

const { width } = Dimensions.get('window');

interface ExercicioAtivo {
  id: number;
  nome: string;
  grupo_muscular?: string;
  series?: string;
  repeticoes?: string;
  carga?: string;
  ajuste?: string;
  observacoes?: string;
  seriesConcluidas: number;
  seriesRealizadas: Array<{
    serie: number;
    repeticoes: string;
    carga: string;
    observacoes: string;
    tempoCadencia: number;
  }>;
  descanso?: string;
  maquina?: string;
}

export default function TreinoAtivoScreen() {
  const { fichaId } = useLocalSearchParams();
  const router = useRouter();

  const { fichas } = useFichasStore();
  const { alunos, initializeDatabase } = useAlunosStore();
  const { exercicios, loadExerciciosByFichaId } = useExerciciosStore();
  const { salvarTreino } = useHistoricoStore();

  const [ficha, setFicha] = useState<any>(null);
  const [aluno, setAluno] = useState<any>(null);
  const [exerciciosAtivos, setExerciciosAtivos] = useState<ExercicioAtivo[]>([]);
  const [exercicioAtual, setExercicioAtual] = useState<number>(0);
  const [serieAtual, setSerieAtual] = useState<number>(1);
  const [dataInicio, setDataInicio] = useState<string>('');
  const [observacaoAtual, setObservacaoAtual] = useState<string>('');
  const [mostrarObservacao, setMostrarObservacao] = useState<boolean>(false);
  const cronometroRef = React.useRef<CronometroHandle>(null);
  const [contagemRegressiva, setContagemRegressiva] = useState<number>(5);
  const [treinoIniciado, setTreinoIniciado] = useState<boolean>(false);
  const [serieEmAndamento, setSerieEmAndamento] = useState<boolean>(false);
  const [mostrarPopupExercicio, setMostrarPopupExercicio] = useState<{ visivel: boolean, proximoNome: string | null }>({ visivel: false, proximoNome: null });
  const [descansoAtivo, setDescansoAtivo] = useState(false);
  const [tempoDescanso, setTempoDescanso] = useState(0);
  const [timerDescanso, setTimerDescanso] = useState(0);
  const [historicoExercicio, setHistoricoExercicio] = useState<any>(null);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'info' | 'warning' | 'error',
    onConfirm: () => { },
    showCancel: false
  });

  // Função para tocar bip (apenas vibração)
  const tocarBip = () => {
    Vibration.vibrate(100);
  };

  const [restEndTime, setRestEndTime] = useState<number | null>(null);

  // Iniciar descanso
  const iniciarDescanso = (segundos: number) => {
    setTempoDescanso(segundos);
    setTimerDescanso(segundos);
    setRestEndTime(Date.now() + (segundos * 1000));
    setDescansoAtivo(true);
  };

  // Efeito do timer de descanso
  useEffect(() => {
    let interval: any;
    if (descansoAtivo && restEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((restEndTime - now) / 1000);

        if (diff <= 5 && diff > 0 && diff !== timerDescanso) {
          tocarBip();
        }

        if (diff <= 0) {
          setTimerDescanso(0);
          setDescansoAtivo(false);
          setRestEndTime(null);
          Vibration.vibrate([0, 500, 200, 500]);
        } else {
          setTimerDescanso(diff);
        }
      }, 500); // Check every 500ms to be responsive but not too heavy
    } else if (!descansoAtivo) {
      setRestEndTime(null);
    }
    return () => clearInterval(interval);
  }, [descansoAtivo, restEndTime]);

  // Função para calcular resumo do histórico do exercício
  const calcularHistoricoExercicio = async (exercicioId: number) => {
    try {
      const db = await getDatabase();

      const historico = await db.getAllAsync(`
        SELECT hs.*, ht.data_inicio
        FROM historico_series hs
        JOIN historico_treinos ht ON hs.historico_treino_id = ht.id
        WHERE hs.exercicio_id = ?
        ORDER BY ht.data_inicio DESC
        LIMIT 20
      `, exercicioId);

      if (historico.length === 0) {
        setHistoricoExercicio(null);
        return;
      }

      const cargas = historico.map((h: any) => parseFloat(h.carga) || 0).filter((c: number) => c > 0);
      const repeticoes = historico.map((h: any) => parseFloat(h.repeticoes) || 0).filter((r: number) => r > 0);

      const ultimaCarga = cargas.length > 0 ? cargas[0] : 0;
      const mediaCarga = cargas.length > 0 ? cargas.reduce((a: number, b: number) => a + b, 0) / cargas.length : 0;
      const mediaRepeticoes = repeticoes.length > 0 ? repeticoes.reduce((a: number, b: number) => a + b, 0) / repeticoes.length : 0;

      let tendencia = 'mantendo';
      if (cargas.length >= 6) {
        const ultimas3 = cargas.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3;
        const anteriores3 = cargas.slice(3, 6).reduce((a: number, b: number) => a + b, 0) / 3;
        if (ultimas3 > anteriores3 * 1.05) tendencia = 'melhorando';
        else if (ultimas3 < anteriores3 * 0.95) tendencia = 'diminuindo';
      }

      setHistoricoExercicio({
        ultimaCarga: ultimaCarga.toFixed(1),
        mediaCarga: mediaCarga.toFixed(1),
        mediaRepeticoes: mediaRepeticoes.toFixed(0),
        tendencia,
        totalTreinos: historico.length
      });
    } catch (error) {
      console.error('Erro ao calcular histórico:', error);
      setHistoricoExercicio(null);
    }
  };

  // Carregar histórico quando mudar o exercício
  useEffect(() => {
    if (exerciciosAtivos.length > 0 && exercicioAtual < exerciciosAtivos.length) {
      const exercicio = exerciciosAtivos[exercicioAtual];
      calcularHistoricoExercicio(exercicio.id);
    }
  }, [exercicioAtual, exerciciosAtivos]);

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      if (fichaId) {
        await loadExerciciosByFichaId(Number(fichaId));
      }
    };
    initDB();

    // Registrar início do treino
    setDataInicio(new Date().toISOString());
  }, [fichaId, initializeDatabase, loadExerciciosByFichaId]);

  useEffect(() => {
    // Encontrar a ficha e aluno
    const fichaAtual = fichas.find(f => f.id === Number(fichaId));
    if (fichaAtual) {
      setFicha(fichaAtual);
      const alunoFicha = alunos.find(a => a.id === fichaAtual.aluno_id);
      setAluno(alunoFicha);
    }
  }, [fichas, alunos, fichaId]);

  useEffect(() => {
    // Preparar exercícios ativos
    const exerciciosFicha = exercicios.filter(e => e.ficha_id === Number(fichaId));
    const exerciciosPreparados = exerciciosFicha.map(ex => ({
      ...ex,
      seriesConcluidas: 0,
      seriesRealizadas: []
    }));
    setExerciciosAtivos(exerciciosPreparados);
  }, [exercicios, fichaId]);

  useEffect(() => {
    if (!treinoIniciado && contagemRegressiva > 0) {
      const timer = setTimeout(() => {
        setContagemRegressiva((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!treinoIniciado && contagemRegressiva === 0) {
      setTreinoIniciado(true);
    }
  }, [contagemRegressiva, treinoIniciado]);

  const handleIniciarSerie = () => {
    setSerieEmAndamento(true);
    setDescansoAtivo(false); // Garante que saiu do descanso
    cronometroRef.current?.reset();
    cronometroRef.current?.start();
  };

  const handleSerieConcluida = async () => {
    if (exerciciosAtivos.length === 0) return;

    // Obter tempo de cadência
    const tempoCadencia = cronometroRef.current?.getSeconds() || 0;

    const exercicio = exerciciosAtivos[exercicioAtual];
    const novaSerie = {
      serie: serieAtual,
      repeticoes: exercicio.repeticoes || '',
      carga: exercicio.carga || '',
      observacoes: observacaoAtual,
      tempoCadencia
    };

    const exerciciosAtualizados = [...exerciciosAtivos];
    exerciciosAtualizados[exercicioAtual] = {
      ...exercicio,
      seriesConcluidas: exercicio.seriesConcluidas + 1,
      seriesRealizadas: [...exercicio.seriesRealizadas, novaSerie]
    };

    setExerciciosAtivos(exerciciosAtualizados);
    setObservacaoAtual('');
    setMostrarObservacao(false);

    // Verificar se terminou todas as séries do exercício atual
    if (exercicio.seriesConcluidas + 1 >= parseInt(exercicio.series || '1')) {
      // Última série: parar o cronômetro
      cronometroRef.current?.reset();
      setSerieEmAndamento(false);
      // Próximo exercício
      if (exercicioAtual + 1 < exerciciosAtivos.length) {
        setMostrarPopupExercicio({ visivel: true, proximoNome: exerciciosAtivos[exercicioAtual + 1].nome });
      } else {
        // Treino concluído
        finalizarTreino(exerciciosAtualizados);
      }
    } else {
      // Próxima série
      setSerieAtual(serieAtual + 1);
      cronometroRef.current?.reset();
      setSerieEmAndamento(false);
      // Iniciar descanso
      const descansoExercicio = parseInt(exercicio.descanso || '0');
      const descansoFicha = parseInt(ficha?.descanso_padrao || '0');
      const descanso = descansoExercicio > 0 ? descansoExercicio : descansoFicha;
      if (descanso > 0) {
        iniciarDescanso(descanso);
      }
    }
  };

  const finalizarTreino = async (exerciciosFinais = exerciciosAtivos) => {
    try {
      const dataFim = new Date().toISOString();
      const seriesData = exerciciosFinais.flatMap(exercicio =>
        exercicio.seriesRealizadas.map(serie => ({
          exercicio_id: exercicio.id,
          serie_numero: serie.serie,
          repeticoes: serie.repeticoes,
          carga: serie.carga,
          observacoes: serie.observacoes,
          tempoCadencia: serie.tempoCadencia
        }))
      );

      await salvarTreino(
        Number(fichaId),
        aluno!.id,
        dataInicio,
        dataFim,
        seriesData
      );

      setModalConfig({
        visible: true,
        title: 'Treino Concluído! 🎉',
        message: 'Parabéns! O treino foi finalizado e salvo no histórico.',
        type: 'success',
        showCancel: false,
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, visible: false }));
          router.back();
        }
      });
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      setModalConfig({
        visible: true,
        title: 'Erro',
        message: 'Ocorreu um erro ao salvar o treino.',
        type: 'error',
        showCancel: false,
        onConfirm: () => setModalConfig(prev => ({ ...prev, visible: false }))
      });
    }
  };

  const handleConfirmarFinalizar = () => {
    setModalConfig({
      visible: true,
      title: 'Finalizar Treino',
      message: 'Deseja finalizar o treino agora mesmo com os exercícios incompletos?',
      type: 'warning',
      showCancel: true,
      onConfirm: () => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        finalizarTreino();
      }
    });
  };

  const handleFecharPopupExercicio = () => {
    setExercicioAtual(exercicioAtual + 1);
    setSerieAtual(1);
    setMostrarPopupExercicio({ visivel: false, proximoNome: null });
    setSerieEmAndamento(false);
  };

  const pularDescanso = () => {
    setDescansoAtivo(false);
  };

  if (!ficha || !aluno || exerciciosAtivos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Carregando treino...</Text>
      </View>
    );
  }

  // Tela de Contagem Regressiva
  if (!treinoIniciado) {
    return (
      <View style={styles.countdownContainer}>
        <StatusBar style="light" />
        <Text style={styles.countdownLabel}>Prepare-se!</Text>
        <Text style={styles.countdownNumber}>{contagemRegressiva}</Text>
        <Text style={styles.countdownFooter}>O treino vai começar...</Text>
      </View>
    );
  }

  // Popup de Próximo Exercício
  if (mostrarPopupExercicio.visivel) {
    return (
      <View style={styles.popupContainer}>
        <StatusBar style="light" />
        <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
        <Text style={styles.popupTitle}>Exercício Concluído!</Text>
        <Text style={styles.popupLabel}>Próximo:</Text>
        <Text style={styles.popupNextName}>{mostrarPopupExercicio.proximoNome}</Text>
        <TouchableOpacity style={styles.popupButton} onPress={handleFecharPopupExercicio}>
          <Text style={styles.popupButtonText}>Começar Agora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exercicioAtualData = exerciciosAtivos[exercicioAtual];
  const totalExercicios = exerciciosAtivos.length;
  const progressPercent = ((exercicioAtual) / totalExercicios) * 100;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Compacto */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Treino em Andamento</Text>
          <Text style={styles.headerSubtitle}>{aluno.nome}</Text>
        </View>
        <TouchableOpacity onPress={handleConfirmarFinalizar} style={styles.quitButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Barra de Progresso */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Card do Exercício Principal */}
        <View style={styles.mainCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseIndex}>{exercicioAtual + 1}/{totalExercicios}</Text>
            <Text style={styles.exerciseName}>{exercicioAtualData.nome}</Text>
          </View>

          <View style={styles.badgeContainer}>
            {exercicioAtualData.grupo_muscular && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{exercicioAtualData.grupo_muscular}</Text>
              </View>
            )}
            {exercicioAtualData.maquina && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{exercicioAtualData.maquina}</Text>
              </View>
            )}
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>SÉRIES</Text>
              <Text style={styles.metricValue}>{serieAtual}<Text style={styles.metricTotal}>/{exercicioAtualData.series || 1}</Text></Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>REPS</Text>
              <Text style={styles.metricValue}>{exercicioAtualData.repeticoes || '-'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>CARGA</Text>
              <Text style={styles.metricValue}>{exercicioAtualData.carga || '-'}<Text style={styles.metricUnit}>kg</Text></Text>
            </View>
          </View>

          {exercicioAtualData.ajuste && (
            <Text style={styles.ajusteText}>⚙️ Ajuste: {exercicioAtualData.ajuste}</Text>
          )}

          {/* Cronômetro */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>{descansoAtivo ? 'DESCANSO' : 'TEMPO DE EXECUÇÃO'}</Text>
            {descansoAtivo ? (
              <Text style={styles.restTimerText}>{timerDescanso}s</Text>
            ) : (
              <Cronometro ref={cronometroRef} textStyle={styles.activeTimerText} />
            )}
          </View>

          {/* Botões de Ação Principal */}
          {descansoAtivo ? (
            <View style={styles.restMessageContainer}>
              <Ionicons name="timer-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.restMessageText}>Recupere-se para a próxima série!</Text>
            </View>
          ) : !serieEmAndamento ? (
            <TouchableOpacity style={styles.startButton} onPress={handleIniciarSerie}>
              <Text style={styles.startButtonText}>INICIAR SÉRIE {serieAtual}</Text>
              <Ionicons name="play" size={24} color={theme.colors.background} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishSetButton} onPress={handleSerieConcluida}>
              <Text style={styles.finishSetButtonText}>CONCLUIR SÉRIE</Text>
              <Ionicons name="checkmark" size={28} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Histórico e Observações */}
        <View style={styles.secondarySection}>
          {historicoExercicio && (
            <View style={styles.historyCard}>
              <Text style={styles.cardTitle}>📊 Última Performance</Text>
              <View style={styles.historyRow}>
                <Text style={styles.historyText}>Carga: {historicoExercicio.ultimaCarga}kg</Text>
                <Text style={[
                  styles.trendText,
                  historicoExercicio.tendencia === 'melhorando' ? { color: theme.colors.success } :
                    historicoExercicio.tendencia === 'diminuindo' ? { color: theme.colors.danger } :
                      { color: theme.colors.warning }
                ]}>
                  {historicoExercicio.tendencia === 'melhorando' ? '📈 Subindo' : historicoExercicio.tendencia === 'diminuindo' ? '📉 Caindo' : '➡️ Mantendo'}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.obsButton} onPress={() => setMostrarObservacao(!mostrarObservacao)}>
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.obsButtonText}>
              {mostrarObservacao ? 'Ocultar Observações' : 'Adicionar Observação'}
            </Text>
          </TouchableOpacity>

          {mostrarObservacao && (
            <View style={styles.obsInputContainer}>
              <TextInput
                style={styles.obsInput}
                placeholder="Ex: Carga leve, aumentar na próxima..."
                placeholderTextColor="#666"
                value={observacaoAtual}
                onChangeText={setObservacaoAtual}
                multiline
              />
            </View>
          )}
        </View>

      </ScrollView>

      <CustomModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onClose={() => modalConfig.showCancel && setModalConfig(prev => ({ ...prev, visible: false }))}
        showCancel={modalConfig.showCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.regular,
  },
  countdownContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownLabel: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: theme.fonts.title,
    marginBottom: 20,
  },
  countdownNumber: {
    color: theme.colors.primary,
    fontSize: 120,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
  },
  countdownFooter: {
    color: '#666',
    fontSize: 18,
    marginTop: 20,
    fontFamily: theme.fonts.secondary,
  },
  popupContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupTitle: {
    color: theme.colors.success,
    fontSize: 32,
    fontFamily: theme.fonts.title,
    marginVertical: 20,
  },
  popupLabel: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    marginBottom: 10,
  },
  popupNextName: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.fonts.title,
    textAlign: 'center',
    marginBottom: 40,
  },
  popupButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  popupButtonText: {
    color: theme.colors.background,
    fontSize: 20,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
  },

  // Main Layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.fonts.title,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.title,
  },
  quitButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#222',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  exerciseHeader: {
    marginBottom: 10,
  },
  exerciseIndex: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.fonts.title,
    marginBottom: 4,
  },
  exerciseName: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.fonts.title,
    lineHeight: 32,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#CCC',
    fontSize: 12,
    fontFamily: theme.fonts.secondary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#666',
    fontSize: 12,
    fontFamily: theme.fonts.title,
    marginBottom: 4,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 32, // Aumentado significativamente
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
  },
  metricTotal: {
    fontSize: 18,
    color: '#666',
  },
  metricUnit: {
    fontSize: 16,
    color: '#666',
  },
  ajusteText: {
    color: theme.colors.warning,
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timerLabel: {
    color: '#666',
    fontSize: 14,
    fontFamily: theme.fonts.title,
    marginBottom: 8,
    letterSpacing: 2,
  },
  activeTimerText: {
    color: theme.colors.text,
    fontSize: 64,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  restTimerText: {
    color: theme.colors.primary,
    fontSize: 64,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  restMessageContainer: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
  },
  restMessageText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: theme.fonts.title,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
  },
  startButtonText: {
    color: theme.colors.background,
    fontSize: 18,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
  },
  finishSetButton: {
    backgroundColor: theme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
  },
  finishSetButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
  },
  skipRestButton: {
    display: 'none', // Escondendo caso ainda exista referência
  },
  skipRestButtonText: {
    display: 'none',
  },
  secondarySection: {
    gap: 15,
  },
  historyCard: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#AAA',
    fontSize: 14,
    fontFamily: theme.fonts.title,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyText: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.secondary,
  },
  trendText: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
  },
  obsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    gap: 8,
  },
  obsButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
  },
  obsInputContainer: {
    marginTop: 10,
  },
  obsInput: {
    backgroundColor: '#222',
    color: theme.colors.text,
    padding: 16,
    borderRadius: 12,
    height: 100,
    textAlignVertical: 'top',
  },
});