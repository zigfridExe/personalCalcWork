import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import useFichasStore from '../../../store/useFichasStore';
import useAlunosStore from '../../../store/useAlunosStore';
import useExerciciosStore from '../../../store/useExerciciosStore';

export default function VisualizarFichaScreen() {
  const { id } = useLocalSearchParams();
  const fichaId = Number(id);
  const router = useRouter();
  
  const { fichas, loadFichasByAlunoId } = useFichasStore();
  const { alunos, initializeDatabase } = useAlunosStore();
  const { exercicios, loadExerciciosByFichaId } = useExerciciosStore();

  const [ficha, setFicha] = useState<any>(null);
  const [aluno, setAluno] = useState<any>(null);

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

  const handleIniciarTreino = () => {
    Alert.alert(
      "Iniciar Treino",
      "Deseja iniciar o treino com esta ficha?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Iniciar", onPress: () => {
          router.push(`/treino-ativo/${fichaId}` as any);
        }},
      ]
    );
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
      <View style={styles.header}>
        <Text style={styles.title}>Ficha de Treino</Text>
        <Text style={styles.subtitle}>{ficha.nome}</Text>
        {aluno && <Text style={styles.alunoName}>Aluno: {aluno.nome}</Text>}
      </View>

      {/* Informações da Ficha */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações da Ficha</Text>
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
        <Text style={styles.sectionTitle}>Exercícios</Text>
        
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
        <Button title="🚀 Iniciar Treino" onPress={handleIniciarTreino} color="#4CAF50" />
        <Link href={{ pathname: "/modal-exercicio", params: { fichaId: fichaId } }} asChild>
          <Button title="➕ Adicionar Exercício" />
        </Link>
        <Link href={{ pathname: "/modal-copiar-ficha", params: { fichaId: fichaId } }} asChild>
          <Button title="📋 Copiar Ficha" color="#FF9800" />
        </Link>
        <Link href={{ pathname: "/modal-ficha", params: { fichaId: fichaId, alunoId: ficha.aluno_id } }} asChild>
          <Button title="✏️ Editar Ficha" />
        </Link>
        <Button title="📊 Ver Histórico" onPress={() => router.push(`/historico/${ficha.aluno_id}` as any)} color="#9C27B0" />
        <Button title="⬅️ Voltar" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2196F3',
    marginBottom: 5,
  },
  alunoName: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  exerciciosSection: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  grupoContainer: {
    marginBottom: 20,
  },
  grupoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exercicioContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  exercicioNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    fontWeight: '500',
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  actionsContainer: {
    padding: 15,
    gap: 10,
  },
}); 