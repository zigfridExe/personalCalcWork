import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import useFichasStore from '../../../store/useFichasStore';
import useAlunosStore from '../../../store/useAlunosStore';
import useExerciciosStore from '../../../store/useExerciciosStore';

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
    <View style={styles.container}>
      <Text style={styles.title}>Fichas de Treino {aluno ? `de ${aluno.nome}` : ''}</Text>
      <Link href={{ pathname: "/modal-ficha", params: { alunoId: alunoId } }} asChild>
        <Button title="Adicionar Nova Ficha" />
      </Link>
      <FlatList
        data={fichas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.fichaContainer}>
            <Text style={styles.fichaItem}>Nome: {item.nome}</Text>
            <Text style={styles.fichaDetail}>Objetivos: {item.objetivos}</Text>
            <Text style={styles.fichaDetail}>Professor: {item.professor}</Text>
            <View style={styles.buttonsContainer}>
              {/* Remover botão de Ver Treinos */}
              <Link href={{ pathname: "/modal-ficha", params: { fichaId: item.id, alunoId: alunoId } }} asChild>
                <Button title="Editar" />
              </Link>
              <Button title="Excluir" onPress={() => handleDeleteFicha(item.id)} color="red" />
            </View>
            {/* Listagem de exercícios da ficha */}
            <Text style={styles.fichaDetail}>Exercícios:</Text>
            <Link href={{ pathname: "/modal-exercicio", params: { fichaId: item.id } }} asChild>
              <Button title="Adicionar Novo Exercício" />
            </Link>
            <FlatList
              data={exercicios.filter(e => e.ficha_id === item.id)}
              keyExtractor={(ex) => ex.id.toString()}
              renderItem={({ item: ex }) => (
                <View style={styles.exercicioContainer}>
                  <Text style={styles.exercicioItem}>Nome: {ex.nome}</Text>
                  {ex.grupo_muscular && <Text style={styles.exercicioDetail}>Grupo Muscular: {ex.grupo_muscular}</Text>}
                  {ex.series && <Text style={styles.exercicioDetail}>Séries: {ex.series}</Text>}
                  {ex.repeticoes && <Text style={styles.exercicioDetail}>Repetições: {ex.repeticoes}</Text>}
                  {ex.carga && <Text style={styles.exercicioDetail}>Carga: {ex.carga}</Text>}
                  {ex.ajuste && <Text style={styles.exercicioDetail}>Ajuste: {ex.ajuste}</Text>}
                  <View style={styles.buttonsContainer}>
                    <Link href={{ pathname: "/modal-exercicio", params: { exercicioId: ex.id, fichaId: ex.ficha_id } }} asChild>
                      <Button title="Editar" />
                    </Link>
                    <Button title="Excluir" onPress={() => handleDeleteExercicio(ex.id)} color="red" />
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Nenhum exercício cadastrado para esta ficha.</Text>}
              style={styles.list}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma ficha de treino encontrada para este aluno.</Text>}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    width: '100%',
    marginTop: 20,
  },
  fichaContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  fichaItem: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fichaDetail: {
    fontSize: 14,
    color: 'gray',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  exercicioContainer: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginVertical: 4,
  },
  exercicioItem: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exercicioDetail: {
    fontSize: 14,
    color: 'gray',
  },
});
