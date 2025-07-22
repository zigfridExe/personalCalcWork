import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, Alert } from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import useFichasStore from '../../../store/useFichasStore';
import useAlunosStore from '../../../store/useAlunosStore';
import useExerciciosStore from '../../../store/useExerciciosStore';
import visualizarFichaStyles from '../../../styles/visualizarFichaStyles';

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
      <View style={visualizarFichaStyles.container}>
        <Text style={visualizarFichaStyles.loadingText}>Carregando ficha...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={visualizarFichaStyles.container}>
      <View style={visualizarFichaStyles.header}>
        <Text style={visualizarFichaStyles.title}>Ficha de Treino</Text>
        <Text style={visualizarFichaStyles.subtitle}>{ficha.nome}</Text>
        {aluno && <Text style={visualizarFichaStyles.alunoName}>Aluno: {aluno.nome}</Text>}
      </View>

      {/* Informações da Ficha */}
      <View style={visualizarFichaStyles.infoSection}>
        <Text style={visualizarFichaStyles.sectionTitle}>Informações da Ficha</Text>
        {ficha.objetivos && (
          <View style={visualizarFichaStyles.infoRow}>
            <Text style={visualizarFichaStyles.infoLabel}>Objetivos:</Text>
            <Text style={visualizarFichaStyles.infoValue}>{ficha.objetivos}</Text>
          </View>
        )}
        {ficha.professor && (
          <View style={visualizarFichaStyles.infoRow}>
            <Text style={visualizarFichaStyles.infoLabel}>Professor:</Text>
            <Text style={visualizarFichaStyles.infoValue}>{ficha.professor}</Text>
          </View>
        )}
        {ficha.descanso_padrao && (
          <View style={visualizarFichaStyles.infoRow}>
            <Text style={visualizarFichaStyles.infoLabel}>Descanso Padrão:</Text>
            <Text style={visualizarFichaStyles.infoValue}>{ficha.descanso_padrao}</Text>
          </View>
        )}
        {ficha.observacoes && (
          <View style={visualizarFichaStyles.infoRow}>
            <Text style={visualizarFichaStyles.infoLabel}>Obs:</Text>
            <Text style={visualizarFichaStyles.infoValue}>{ficha.observacoes}</Text>
          </View>
        )}
      </View>

      {/* Exercícios Agrupados */}
      <View style={visualizarFichaStyles.exerciciosSection}>
        <Text style={visualizarFichaStyles.sectionTitle}>Exercícios</Text>
        
        {Object.keys(exerciciosAgrupados).length === 0 ? (
          <Text style={visualizarFichaStyles.emptyText}>Nenhum exercício cadastrado para esta ficha.</Text>
        ) : (
          Object.entries(exerciciosAgrupados).map(([grupo, exerciciosGrupo]: [string, any]) => (
            <View key={grupo} style={visualizarFichaStyles.grupoContainer}>
              <Text style={visualizarFichaStyles.grupoTitle}>{grupo}</Text>
              {exerciciosGrupo.map((exercicio: any, index: number) => (
                <View key={exercicio.id} style={visualizarFichaStyles.exercicioContainer}>
                  <Text style={visualizarFichaStyles.exercicioNome}>{index + 1}. {exercicio.nome}</Text>
                  
                  <View style={visualizarFichaStyles.exercicioDetails}>
                    {exercicio.series && (
                      <View style={visualizarFichaStyles.detailRow}>
                        <Text style={visualizarFichaStyles.detailLabel}>Séries:</Text>
                        <Text style={visualizarFichaStyles.detailValue}>{exercicio.series}</Text>
                      </View>
                    )}
                    {exercicio.repeticoes && (
                      <View style={visualizarFichaStyles.detailRow}>
                        <Text style={visualizarFichaStyles.detailLabel}>Repetições:</Text>
                        <Text style={visualizarFichaStyles.detailValue}>{exercicio.repeticoes}</Text>
                      </View>
                    )}
                    {exercicio.carga && (
                      <View style={visualizarFichaStyles.detailRow}>
                        <Text style={visualizarFichaStyles.detailLabel}>Carga:</Text>
                        <Text style={visualizarFichaStyles.detailValue}>{exercicio.carga}</Text>
                      </View>
                    )}
                    {exercicio.ajuste && (
                      <View style={visualizarFichaStyles.detailRow}>
                        <Text style={visualizarFichaStyles.detailLabel}>Ajuste:</Text>
                        <Text style={visualizarFichaStyles.detailValue}>{exercicio.ajuste}</Text>
                      </View>
                    )}
                    {exercicio.maquina && (
                      <View style={visualizarFichaStyles.detailRow}>
                        <Text style={visualizarFichaStyles.detailLabel}>Máquina:</Text>
                        <Text style={visualizarFichaStyles.detailValue}>{exercicio.maquina}</Text>
                      </View>
                    )}
                    {exercicio.observacoes && (
                      <View style={visualizarFichaStyles.detailRow}>
                        <Text style={visualizarFichaStyles.detailLabel}>Obs:</Text>
                        <Text style={visualizarFichaStyles.detailValue}>{exercicio.observacoes}</Text>
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
      <View style={visualizarFichaStyles.actionsContainer}>
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