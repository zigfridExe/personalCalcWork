import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, Link, useRouter, Stack } from 'expo-router';
import useFichasStore from '../../../store/useFichasStore';
import useAlunosStore from '../../../store/useAlunosStore';
import useExerciciosStore from '../../../store/useExerciciosStore';
import useAulasStore from '../../../store/useAulasStore';
import CustomModal from '../../../components/CustomModal';
import { theme } from '../../../src/styles/theme';

export default function VisualizarFichaScreen() {
  const { id } = useLocalSearchParams();
  const fichaId = Number(id);
  const router = useRouter();

  const { fichas, loadFichasByAlunoId } = useFichasStore();
  const { alunos, initializeDatabase } = useAlunosStore();
  const { exercicios, loadExerciciosByFichaId } = useExerciciosStore();
  const { obterAulasDoAluno, criarAulaAvulsa, carregarCalendario } = useAulasStore();

  const [ficha, setFicha] = useState<any>(null);
  const [aluno, setAluno] = useState<any>(null);
  const [modalAulaVisible, setModalAulaVisible] = useState(false);
  const [loadingAula, setLoadingAula] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      if (fichaId) {
        // Carregar exercícios da ficha
        await loadExerciciosByFichaId(fichaId);
      }
    };
    initDB();
  }, [fichaId, initializeDatabase, loadExerciciosByFichaId]);

  useEffect(() => {
    // Encontrar a ficha atual
    const fichaAtual = fichas.find(f => f.id === fichaId);
    if (fichaAtual) {
      setFicha(fichaAtual);
      // Encontrar o aluno da ficha
      const alunoFicha = alunos.find(a => a.id === fichaAtual.aluno_id);
      setAluno(alunoFicha);
    }
  }, [fichas, alunos, fichaId]);

  // Agrupar exercícios por grupo muscular
  const exerciciosAgrupados = exercicios
    .filter(e => e.ficha_id === fichaId)
    .reduce((groups: any, exercicio) => {
      const grupo = exercicio.grupo_muscular || 'Outros';
      if (!groups[grupo]) {
        groups[grupo] = [];
      }
      groups[grupo].push(exercicio);
      return groups;
    }, {});

  const iniciarTreinoDireto = () => {
    router.push(`/treino-ativo/${fichaId}` as any);
  };

  const handleIniciarTreino = async () => {
    if (!ficha || !ficha.aluno_id) return;

    setLoadingAula(true);
    try {
      const hoje = new Date();
      // Garantir intervalo do dia inteiro
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

      const aulasHoje = await obterAulasDoAluno(ficha.aluno_id, inicioDia, fimDia);

      // Filtra apenas aulas válidas (não canceladas)
      const aulasValidas = aulasHoje.filter(a => a.status !== 'CANCELADA');

      if (aulasValidas.length > 0) {
        // Já tem aula, só pergunta se quer iniciar
        Alert.alert(
          "Iniciar Treino",
          "Deseja iniciar o treino com esta ficha?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Iniciar", onPress: iniciarTreinoDireto },
          ]
        );
      } else {
        // Não tem aula, oferece criar avulsa
        setModalAulaVisible(true);
      }
    } catch (error) {
      console.error('Erro ao verificar aulas:', error);
      Alert.alert('Erro', 'Não foi possível verificar a agenda. Iniciando treino mesmo assim.');
      iniciarTreinoDireto();
    } finally {
      setLoadingAula(false);
    }
  };

  const handleConfirmarAulaAvulsa = async () => {
    if (!ficha || !ficha.aluno_id) return;

    try {
      const agora = new Date();
      const dataStr = agora.toISOString().slice(0, 10);
      const horaStr = agora.toTimeString().slice(0, 5); // HH:mm

      await criarAulaAvulsa(ficha.aluno_id, dataStr, horaStr, 60, `Aula Avulsa - Ficha: ${ficha.nome}`);

      setModalAulaVisible(false);
      iniciarTreinoDireto();
    } catch (error) {
      console.error('Erro ao criar aula avulsa:', error);
      Alert.alert('Erro', 'Erro ao criar aula avulsa.');
    }
  };

  if (!ficha) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando ficha...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Ficha de Treino', headerTitleAlign: 'center' }} />
      <View style={styles.header}>
        <Text style={styles.title}>Ficha de Treino</Text>
        <Text style={styles.subtitle}>{ficha.nome}</Text>
        {aluno && <Text style={styles.alunoName}>Aluno: {aluno.nome}</Text>}
      </View>

      {/* Informações da Ficha */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informações da Ficha</Text>
          <Link href={{ pathname: "/modal-ficha", params: { fichaId: fichaId, alunoId: ficha.aluno_id } }} asChild>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </Link>
        </View>
        {ficha.objetivos && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Objetivos:</Text>
            <Text style={styles.infoValue}>{ficha.objetivos}</Text>
          </View>
        )}
        {ficha.professor && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Professor:</Text>
            <Text style={styles.infoValue}>{ficha.professor}</Text>
          </View>
        )}
        {ficha.descanso_padrao && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descanso Padrão:</Text>
            <Text style={styles.infoValue}>{ficha.descanso_padrao}</Text>
          </View>
        )}
        {ficha.observacoes && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Observações:</Text>
            <Text style={styles.infoValue}>{ficha.observacoes}</Text>
          </View>
        )}
      </View>

      {/* Exercícios Agrupados */}
      <View style={styles.exerciciosSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exercícios</Text>
          <Link href={{ pathname: "/modal-exercicio", params: { fichaId: fichaId } }} asChild>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {Object.keys(exerciciosAgrupados).length === 0 ? (
          <Text style={styles.emptyText}>Nenhum exercício cadastrado para esta ficha.</Text>
        ) : (
          Object.entries(exerciciosAgrupados).map(([grupo, exerciciosGrupo]: [string, any]) => (
            <View key={grupo} style={styles.grupoContainer}>
              <Text style={styles.grupoTitle}>{grupo}</Text>
              {exerciciosGrupo.map((exercicio: any, index: number) => (
                <View key={exercicio.id} style={styles.exercicioContainer}>
                  <Text style={styles.exercicioNome}>{index + 1}. {exercicio.nome}</Text>

                  <View style={styles.exercicioDetails}>
                    {exercicio.series && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Séries:</Text>
                        <Text style={styles.detailValue}>{exercicio.series}</Text>
                      </View>
                    )}
                    {exercicio.repeticoes && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Repetições:</Text>
                        <Text style={styles.detailValue}>{exercicio.repeticoes}</Text>
                      </View>
                    )}
                    {exercicio.carga && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Carga:</Text>
                        <Text style={styles.detailValue}>{exercicio.carga}</Text>
                      </View>
                    )}
                    {exercicio.ajuste && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Ajuste:</Text>
                        <Text style={styles.detailValue}>{exercicio.ajuste}</Text>
                      </View>
                    )}
                    {exercicio.maquina && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Máquina:</Text>
                        <Text style={styles.detailValue}>{exercicio.maquina}</Text>
                      </View>
                    )}
                    {exercicio.observacoes && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Obs:</Text>
                        <Text style={styles.detailValue}>{exercicio.observacoes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, loadingAula && { opacity: 0.7 }]}
          onPress={handleIniciarTreino}
          disabled={loadingAula}
        >
          <Text style={styles.primaryButtonText}>
            {loadingAula ? 'Verificando...' : '🚀 INICIAR TREINO'}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActionsRow}>
          <Link href={{ pathname: "/modal-copiar-ficha", params: { fichaId: fichaId } }} asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>📋 Copiar</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push(`/historico/${ficha.aluno_id}` as any)}>
            <Text style={styles.secondaryButtonText}>📊 Histórico</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomModal
        visible={modalAulaVisible}
        title="Aula Não Agendada"
        message="O aluno não possui aula marcada para hoje. Deseja lançar uma aula avulsa agora?"
        type="warning"
        confirmText="SIM, LANÇAR AULA"
        showCancel
        onClose={() => setModalAulaVisible(false)}
        onConfirm={handleConfirmarAulaAvulsa}
      />
    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: 60, // Adjust for status bar if needed
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 28, // Aumentado para maior destaque
    fontFamily: theme.fonts.title, // Mudado para fonte bold/title
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  alunoName: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.secondary,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  infoSection: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    marginBottom: 10,
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.secondary,
    flex: 1,
  },
  exerciciosSection: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  grupoContainer: {
    marginBottom: 20,
  },
  grupoTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  exercicioContainer: {
    backgroundColor: theme.colors.background,
    padding: 12,
    marginBottom: 8,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  exercicioNome: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  exercicioDetails: {
    marginLeft: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.fonts.secondary,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 20,
    fontFamily: theme.fonts.secondary,
  },
  actionsContainer: {
    padding: theme.spacing.md,
    gap: 16,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    elevation: 3,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    fontSize: 14,
  },
}); 