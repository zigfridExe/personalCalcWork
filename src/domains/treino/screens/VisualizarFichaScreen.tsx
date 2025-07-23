import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useFichasStore from '../store/useFichasStore';
import useAlunosStore from '../store/useAlunosStore';
import useExerciciosStore from '../store/useExerciciosStore';
import visualizarFichaStyles from '../styles/visualizarFichaStyles';

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
        { text: "Iniciar", onPress: () => router.push(`/treino-ativo/${fichaId}`) }
      ]
    );
  };

  if (!ficha || !aluno) {
    return <Text>Carregando ficha...</Text>;
  }

  return (
    <ScrollView style={visualizarFichaStyles.container}>
      <Text style={visualizarFichaStyles.title}>Ficha de Treino</Text>
      <Text style={visualizarFichaStyles.subtitle}>Aluno: {aluno.nome}</Text>
      <Button title="Iniciar Treino" onPress={handleIniciarTreino} />
      {Object.entries(exerciciosAgrupados).map(([grupo, exercicios]: any) => (
        <View key={grupo} style={visualizarFichaStyles.grupoContainer}>
          <Text style={visualizarFichaStyles.grupoTitle}>{grupo}</Text>
          {exercicios.map((ex: any) => (
            <View key={ex.id} style={visualizarFichaStyles.exercicioContainer}>
              <Text style={visualizarFichaStyles.exercicioNome}>{ex.nome}</Text>
              <Text style={visualizarFichaStyles.exercicioInfo}>
                Séries: {ex.series} | Repetições: {ex.repeticoes} | Carga: {ex.carga}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
