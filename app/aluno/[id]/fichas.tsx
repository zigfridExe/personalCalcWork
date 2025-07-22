import React, { useEffect } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import useFichasStore from '../../../store/useFichasStore';
import useAlunosStore from '../../../store/useAlunosStore';
import useExerciciosStore from '../../../store/useExerciciosStore';
import fichasStyles from '../../../styles/fichasStyles';

export default function FichasScreen() {
  const { id } = useLocalSearchParams();
  const alunoId = Number(id);
  const { fichas, loadFichasByAlunoId, deleteFicha } = useFichasStore();
  const { alunos, initializeDatabase } = useAlunosStore();
  const { exercicios, loadExerciciosByFichaId, deleteExercicio } = useExerciciosStore();

  const aluno = alunos.find(a => a.id === alunoId);

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      if (alunoId) {
        loadFichasByAlunoId(alunoId);
      }
    };
    initDB();
  }, [alunoId, initializeDatabase, loadFichasByAlunoId]);

  // Função para carregar exercícios ao expandir ficha
  const handleExpandFicha = (fichaId: number) => {
    loadExerciciosByFichaId(fichaId);
  };

  const handleDeleteFicha = (fichaId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir esta ficha de treino?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => deleteFicha(fichaId), style: "destructive" },
      ]
    );
  };

  const handleDeleteExercicio = (exercicioId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir este exercício?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => deleteExercicio(exercicioId), style: "destructive" },
      ]
    );
  };

  return (
    <View style={fichasStyles.container}>
      <Text style={fichasStyles.title}>Fichas de Treino {aluno ? `de ${aluno.nome}` : ''}</Text>
      <Link href={{ pathname: "/modal-ficha", params: { alunoId: alunoId } }} asChild>
        <Button title="Adicionar Nova Ficha" />
      </Link>
      <FlatList
        data={fichas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={fichasStyles.fichaContainer}>
            <Text style={fichasStyles.fichaItem}>Nome: {item.nome}</Text>
            <Text style={fichasStyles.fichaDetail}>Objetivos: {item.objetivos}</Text>
            <Text style={fichasStyles.fichaDetail}>Professor: {item.professor}</Text>
            <View style={fichasStyles.buttonsContainer}>
              <Link href={{ pathname: "/ficha/[id]/visualizar", params: { id: item.id } }} asChild>
                <Button title="Visualizar" color="#2196F3" />
              </Link>
              <Link href={{ pathname: "/modal-copiar-ficha", params: { fichaId: item.id } }} asChild>
                <Button title="📋 Copiar" color="#FF9800" />
              </Link>
              <Link href={{ pathname: "/modal-ficha", params: { fichaId: item.id, alunoId: alunoId } }} asChild>
                <Button title="Editar" />
              </Link>
              <Button title="Excluir" onPress={() => handleDeleteFicha(item.id)} color="red" />
            </View>
            {/* Listagem de exercícios da ficha */}
            <Text style={fichasStyles.fichaDetail}>Exercícios:</Text>
            <Link href={{ pathname: "/modal-exercicio", params: { fichaId: item.id } }} asChild>
              <Button title="Adicionar Novo Exercício" />
            </Link>
            <FlatList
              data={exercicios.filter(e => e.ficha_id === item.id)}
              keyExtractor={(ex) => ex.id.toString()}
              renderItem={({ item: ex }) => (
                <View style={fichasStyles.exercicioContainer}>
                  <Text style={fichasStyles.exercicioItem}>Nome: {ex.nome}</Text>
                  {ex.grupo_muscular && <Text style={fichasStyles.exercicioDetail}>Grupo Muscular: {ex.grupo_muscular}</Text>}
                  {ex.series && <Text style={fichasStyles.exercicioDetail}>Séries: {ex.series}</Text>}
                  {ex.repeticoes && <Text style={fichasStyles.exercicioDetail}>Repetições: {ex.repeticoes}</Text>}
                  {ex.carga && <Text style={fichasStyles.exercicioDetail}>Carga: {ex.carga}</Text>}
                  {ex.ajuste && <Text style={fichasStyles.exercicioDetail}>Ajuste: {ex.ajuste}</Text>}
                  <View style={fichasStyles.buttonsContainer}>
                    <Link href={{ pathname: "/modal-exercicio", params: { exercicioId: ex.id, fichaId: ex.ficha_id } }} asChild>
                      <Button title="Editar" />
                    </Link>
                    <Button title="Excluir" onPress={() => handleDeleteExercicio(ex.id)} color="red" />
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={fichasStyles.emptyText}>Nenhum exercício cadastrado para esta ficha.</Text>}
              style={fichasStyles.list}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={fichasStyles.emptyText}>Nenhuma ficha de treino encontrada para este aluno.</Text>}
        style={fichasStyles.list}
      />
    </View>
  );
}
