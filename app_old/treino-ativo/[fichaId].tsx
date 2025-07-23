import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
// Remover import do Audio

import useFichasStore from '../../store/useFichasStore';
import useAlunosStore from '../../store/useAlunosStore';
import useExerciciosStore from '../../store/useExerciciosStore';
import useHistoricoStore from '../../store/useHistoricoStore';
import Cronometro, { CronometroHandle } from '../../components/Cronometro';
import { getDatabase } from '../../utils/databaseUtils';

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
    tempoCadencia: number; // Adicionado para armazenar o tempo de cadência
  }>;
  descanso?: string; // Adicionado para armazenar o tempo de descanso
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
  const [ultimoTempo, setUltimoTempo] = useState<number>(0);
  const [contagemRegressiva, setContagemRegressiva] = useState<number>(5);
  const [treinoIniciado, setTreinoIniciado] = useState<boolean>(false);
  const [serieEmAndamento, setSerieEmAndamento] = useState<boolean>(false);
  const [mostrarPopupExercicio, setMostrarPopupExercicio] = useState<{ visivel: boolean, proximoNome: string | null }>({ visivel: false, proximoNome: null });
  const [descansoAtivo, setDescansoAtivo] = useState(false);
  const [tempoDescanso, setTempoDescanso] = useState(0);
  const [timerDescanso, setTimerDescanso] = useState(0);
  const [botaoHabilitado, setBotaoHabilitado] = useState(true);
  const [historicoExercicio, setHistoricoExercicio] = useState<any>(null);

  // Função para tocar bip (apenas vibração)
  const tocarBip = () => {
    Vibration.vibrate(100);
  };

  // Iniciar descanso
  const iniciarDescanso = (segundos: number) => {
    setTempoDescanso(segundos);
    setTimerDescanso(segundos);
    setDescansoAtivo(true);
    setBotaoHabilitado(false);
  };

  // Efeito do timer de descanso
  useEffect(() => {
    let interval: any;
    if (descansoAtivo && timerDescanso > 0) {
      interval = setInterval(() => {
        setTimerDescanso((prev) => {
          const novoValor = prev - 1;
          // Bip/vibração nos últimos 5 segundos
          if (novoValor <= 5 && novoValor > 0) {
            tocarBip();
          }
          return novoValor;
        });
      }, 1000);
    } else if (descansoAtivo && timerDescanso === 0) {
      setDescansoAtivo(false);
      setBotaoHabilitado(true);
    }
    return () => clearInterval(interval);
  }, [descansoAtivo, timerDescanso]);

  // Função para calcular resumo do histórico do exercício
  const calcularHistoricoExercicio = async (exercicioId: number) => {
    try {
      const db = await getDatabase();
      
      // Buscar histórico das últimas 5 vezes que o exercício foi realizado
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

      // Calcular estatísticas
      const cargas = historico.map((h: any) => parseFloat(h.carga) || 0).filter((c: number) => c > 0);
      const repeticoes = historico.map((h: any) => parseFloat(h.repeticoes) || 0).filter((r: number) => r > 0);
      
      const ultimaCarga = cargas.length > 0 ? cargas[0] : 0;
      const mediaCarga = cargas.length > 0 ? cargas.reduce((a: number, b: number) => a + b, 0) / cargas.length : 0;
      const mediaRepeticoes = repeticoes.length > 0 ? repeticoes.reduce((a: number, b: number) => a + b, 0) / repeticoes.length : 0;
      
      // Calcular tendência (últimas 3 vs anteriores)
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
        totalTreinos: historico.length,
        ultimaData: (historico[0] as any)?.data_inicio
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

  /*
  useEffect(() => {
    if (treinoIniciado) {
      // Teste: agendar notificação para 5 segundos após início do treino
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora de se hidratar! 💧',
          body: 'Lembre-se de beber água durante o treino.',
        },
        trigger: { seconds: 5 },
      });
    }
  }, [treinoIniciado]);
  */

  const handleIniciarSerie = () => {
    setSerieEmAndamento(true);
    cronometroRef.current?.reset();
    cronometroRef.current?.start();
  };

  // Modificar handleSerieConcluida para iniciar descanso se não for última série
  const handleSerieConcluida = async () => {
    if (exerciciosAtivos.length === 0) return;

    // Obter tempo de cadência
    const tempoCadencia = cronometroRef.current?.getSeconds() || 0;
    setUltimoTempo(tempoCadencia);

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
        try {
          const dataFim = new Date().toISOString();
          
          // Preparar dados das séries realizadas
          const seriesData = exerciciosAtualizados.flatMap(exercicio => 
            exercicio.seriesRealizadas.map(serie => ({
              exercicio_id: exercicio.id,
              serie_numero: serie.serie,
              repeticoes: serie.repeticoes,
              carga: serie.carga,
              observacoes: serie.observacoes,
              tempoCadencia: serie.tempoCadencia // Adicionar tempo de cadência
            }))
          );

          // Salvar no histórico
          await salvarTreino(
            Number(fichaId),
            aluno!.id,
            dataInicio,
            dataFim,
            seriesData
          );

          Alert.alert(
            'Treino Concluído! 🎉',
            'Parabéns! O treino foi finalizado e salvo no histórico com sucesso.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } catch (error) {
          console.error('Erro ao salvar treino:', error);
          Alert.alert(
            'Treino Concluído! 🎉',
            'Parabéns! O treino foi finalizado com sucesso.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      }
    } else {
      // Próxima série: reinicia o cronômetro, mas só inicia ao clicar no botão
      setSerieAtual(serieAtual + 1);
      cronometroRef.current?.reset();
      setSerieEmAndamento(false);
      // Iniciar descanso
      const descansoExercicio = parseInt(exercicio.descanso || '0');
      const descansoFicha = parseInt(ficha.descanso_padrao || '0');
      const descanso = descansoExercicio > 0 ? descansoExercicio : descansoFicha;
      if (descanso > 0) {
        iniciarDescanso(descanso);
      } else {
        setBotaoHabilitado(true);
      }
    }
  };

  const handleFinalizarTreino = async () => {
    Alert.alert(
      'Finalizar Treino',
      'Tem certeza que deseja finalizar o treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          onPress: async () => {
            try {
              const dataFim = new Date().toISOString();
              
              // Preparar dados das séries realizadas
              const seriesData = exerciciosAtivos.flatMap(exercicio => 
                exercicio.seriesRealizadas.map(serie => ({
                  exercicio_id: exercicio.id,
                  serie_numero: serie.serie,
                  repeticoes: serie.repeticoes,
                  carga: serie.carga,
                  observacoes: serie.observacoes,
                  tempoCadencia: serie.tempoCadencia // Adicionar tempo de cadência
                }))
              );

              // Salvar no histórico
              await salvarTreino(
                Number(fichaId),
                aluno!.id,
                dataInicio,
                dataFim,
                seriesData
              );

              Alert.alert(
                'Treino Finalizado! 🎉',
                'O treino foi salvo no histórico com sucesso.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              console.error('Erro ao salvar treino:', error);
              Alert.alert(
                'Erro',
                'Erro ao salvar o treino no histórico.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const handleFecharPopupExercicio = () => {
    setExercicioAtual(exercicioAtual + 1);
    setSerieAtual(1);
    setMostrarPopupExercicio({ visivel: false, proximoNome: null });
    setSerieEmAndamento(false);
  };

  if (!ficha || !aluno || exerciciosAtivos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando treino...</Text>
      </View>
    );
  }

  if (!treinoIniciado) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24 }}>Prepare-se!</Text>
        <Text style={{ fontSize: 80, fontWeight: 'bold', color: '#2196F3', marginBottom: 24 }}>{contagemRegressiva}</Text>
        <Text style={{ fontSize: 20 }}>O treino vai começar em...</Text>
      </View>
    );
  }

  if (mostrarPopupExercicio.visivel && exercicioAtual + 1 < exerciciosAtivos.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24 }}>Exercício concluído!</Text>
        <Text style={{ fontSize: 22, marginBottom: 24 }}>Próximo exercício:</Text>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2196F3', marginBottom: 32 }}>{mostrarPopupExercicio.proximoNome}</Text>
        <TouchableOpacity style={{ backgroundColor: '#2196F3', padding: 16, borderRadius: 8 }} onPress={handleFecharPopupExercicio}>
          <Text style={{ color: '#fff', fontSize: 20 }}>OK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const exercicioAtualData = exerciciosAtivos[exercicioAtual];
  const seriesRestantes = parseInt(exercicioAtualData.series || '1') - exercicioAtualData.seriesConcluidas;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Cronometro ref={cronometroRef} />
      {!serieEmAndamento ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {descansoAtivo ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginBottom: 12 }}>Intervalo de descanso</Text>
              <Text style={{ fontSize: 64, fontWeight: 'bold', color: '#2196F3' }}>{timerDescanso}s</Text>
              <Text style={{ fontSize: 16, marginTop: 8 }}>Aguarde para iniciar a próxima série</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={{ backgroundColor: botaoHabilitado ? '#2196F3' : '#aaa', padding: 24, borderRadius: 12, marginTop: 24 }}
            onPress={handleIniciarSerie}
            disabled={!botaoHabilitado}
          >
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>Iniciar série {serieAtual}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Treino Ativo</Text>
            <Text style={styles.subtitle}>{ficha.nome}</Text>
            <Text style={styles.alunoName}>{aluno.nome}</Text>
          </View>

          {/* Progresso Geral */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Progresso Geral</Text>
            <Text style={styles.progressText}>
              Exercício {exercicioAtual + 1} de {exerciciosAtivos.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((exercicioAtual + 1) / exerciciosAtivos.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Exercício Atual */}
          <View style={styles.exercicioSection}>
            <Text style={styles.sectionTitle}>Exercício Atual</Text>
            <View style={styles.exercicioCard}>
              <Text style={styles.exercicioNome}>{exercicioAtualData.nome}</Text>
              {exercicioAtualData.grupo_muscular && (
                <Text style={styles.exercicioGrupo}>{exercicioAtualData.grupo_muscular}</Text>
              )}
              
              <View style={styles.exercicioInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Séries:</Text>
                  <Text style={styles.infoValue}>
                    {exercicioAtualData.seriesConcluidas}/{exercicioAtualData.series || '1'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Repetições:</Text>
                  <Text style={styles.infoValue}>{exercicioAtualData.repeticoes || '-'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Carga:</Text>
                  <Text style={styles.infoValue}>{exercicioAtualData.carga || '-'}</Text>
                </View>
                {exercicioAtualData.ajuste && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ajuste:</Text>
                    <Text style={styles.infoValue}>{exercicioAtualData.ajuste}</Text>
                  </View>
                )}
              </View>

              {exercicioAtualData.observacoes && (
                <Text style={styles.observacoes}>Obs: {exercicioAtualData.observacoes}</Text>
              )}
              
              {/* Séries Realizadas */}
              {exercicioAtualData.seriesRealizadas.length > 0 && (
                <View style={styles.seriesRealizadasContainer}>
                  <Text style={styles.seriesRealizadasTitle}>Séries Realizadas:</Text>
                  {exercicioAtualData.seriesRealizadas.map((serie, index) => (
                    <View key={index} style={styles.serieRealizada}>
                      <Text style={styles.serieRealizadaText}>
                        Série {serie.serie}: {serie.repeticoes} reps, {serie.carga}
                      </Text>
                      {serie.observacoes && (
                        <Text style={styles.serieObservacao}>
                          Obs: {serie.observacoes}
                        </Text>
                      )}
                      {serie.tempoCadencia > 0 && (
                        <Text style={styles.serieTempoCadencia}>
                          Tempo de Cadência: {serie.tempoCadencia}s
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Resumo do Histórico do Exercício */}
          {historicoExercicio && (
            <View style={styles.historicoSection}>
              <Text style={styles.sectionTitle}>📊 Histórico do Exercício</Text>
              <View style={styles.historicoCard}>
                <View style={styles.historicoRow}>
                  <View style={styles.historicoItem}>
                    <Text style={styles.historicoLabel}>Última Carga</Text>
                    <Text style={styles.historicoValue}>{historicoExercicio.ultimaCarga}kg</Text>
                  </View>
                  <View style={styles.historicoItem}>
                    <Text style={styles.historicoLabel}>Média Carga</Text>
                    <Text style={styles.historicoValue}>{historicoExercicio.mediaCarga}kg</Text>
                  </View>
                </View>
                <View style={styles.historicoRow}>
                  <View style={styles.historicoItem}>
                    <Text style={styles.historicoLabel}>Média Reps</Text>
                    <Text style={styles.historicoValue}>{historicoExercicio.mediaRepeticoes}</Text>
                  </View>
                  <View style={styles.historicoItem}>
                    <Text style={styles.historicoLabel}>Tendência</Text>
                    <Text style={[
                      styles.historicoValue,
                      historicoExercicio.tendencia === 'melhorando' ? { color: '#4CAF50' } :
                      historicoExercicio.tendencia === 'diminuindo' ? { color: '#f44336' } :
                      { color: '#FF9800' }
                    ]}>
                      {historicoExercicio.tendencia === 'melhorando' ? '📈 Melhorando' :
                       historicoExercicio.tendencia === 'diminuindo' ? '📉 Diminuindo' :
                       '➡️ Mantendo'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historicoFooter}>
                  Baseado em {historicoExercicio.totalTreinos} séries anteriores
                </Text>
              </View>
            </View>
          )}

          {/* Observações */}
          <View style={styles.observacoesSection}>
            <Text style={styles.sectionTitle}>Observações</Text>
            
            <TouchableOpacity 
              style={styles.observacaoToggle}
              onPress={() => setMostrarObservacao(!mostrarObservacao)}
            >
              <Text style={styles.observacaoToggleText}>
                {mostrarObservacao ? '❌ Ocultar Observação' : '📝 Adicionar Observação'}
              </Text>
            </TouchableOpacity>

            {mostrarObservacao && (
              <View style={styles.observacaoInputContainer}>
                <TextInput
                  style={styles.observacaoInput}
                  placeholder="Digite uma observação para esta série..."
                  value={observacaoAtual}
                  onChangeText={setObservacaoAtual}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={styles.observacaoCounter}>
                  {observacaoAtual.length}/200
                </Text>
              </View>
            )}
          </View>

          {/* Controles */}
          <View style={styles.controlsSection}>
            <Text style={styles.sectionTitle}>Controles</Text>
            
            <View style={styles.controlButtons}>
              <TouchableOpacity 
                style={styles.serieButton}
                onPress={handleSerieConcluida}
              >
                <Text style={styles.serieButtonText}>✅ Série Concluída</Text>
                <Text style={styles.serieButtonSubtext}>
                  Série {serieAtual} de {exercicioAtualData.series || '1'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.finalizarButton}
                onPress={handleFinalizarTreino}
              >
                <Text style={styles.finalizarButtonText}>🏁 Finalizar Treino</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de Exercícios */}
          <View style={styles.listaSection}>
            <Text style={styles.sectionTitle}>Lista de Exercícios</Text>
            {exerciciosAtivos.map((exercicio, index) => (
              <View 
                key={exercicio.id} 
                style={[
                  styles.exercicioItem,
                  index === exercicioAtual && styles.exercicioItemAtivo
                ]}
              >
                <Text style={styles.exercicioItemNome}>
                  {index + 1}. {exercicio.nome}
                </Text>
                <Text style={styles.exercicioItemProgresso}>
                  {exercicio.seriesConcluidas}/{exercicio.series || '1'} séries
                </Text>
                {index === exercicioAtual && (
                  <Text style={styles.exercicioItemStatus}>🔄 EM ANDAMENTO</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  },
  alunoName: {
    fontSize: 16,
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
  content: {
    flex: 1,
    padding: 15,
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  exercicioSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  exercicioCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  exercicioNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  exercicioGrupo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  exercicioInfo: {
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  observacoes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  controlsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  controlButtons: {
    gap: 15,
  },
  serieButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  serieButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  serieButtonSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  finalizarButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  finalizarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  listaSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  exercicioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exercicioItemAtivo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  exercicioItemNome: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  exercicioItemProgresso: {
    fontSize: 14,
    color: '#666',
  },
  exercicioItemStatus: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  observacoesSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  observacaoToggle: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  observacaoToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  observacaoInputContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  observacaoInput: {
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  observacaoCounter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  seriesRealizadasContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  seriesRealizadasTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  serieRealizada: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  serieRealizadaText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  serieObservacao: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  serieTempoCadencia: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  historicoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  historicoCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  historicoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historicoItem: {
    flex: 1,
    alignItems: 'center',
  },
  historicoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  historicoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  historicoFooter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
}); 