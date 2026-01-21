import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import useFichasStore from '../../../store/useFichasStore';
import useAlunosStore from '../../../store/useAlunosStore';
import useExerciciosStore from '../../../store/useExerciciosStore';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../src/styles/fichasScreen.styles';

export const options = {
  title: 'Fichas do Aluno'
}

export default function FichasScreen() {
  const { id } = useLocalSearchParams();
  const alunoId = Number(id);
  const { fichas, loadFichasByAlunoId, deleteFicha } = useFichasStore();
  const { alunos, initializeDatabase } = useAlunosStore();
  const { exercicios, loadExerciciosByFichaId, deleteExercicio } = useExerciciosStore();

  const aluno = alunos.find(a => a.id === alunoId);

  // Carrega as fichas do aluno
  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
      if (alunoId) {
        await loadFichasByAlunoId(alunoId);
      }
    };
    initDB();
  }, [alunoId, initializeDatabase, loadFichasByAlunoId]);

  // Carrega os exercícios quando as fichas são carregadas
  useEffect(() => {
    if (fichas.length > 0) {
      // Carrega os exercícios de todas as fichas
      fichas.forEach(ficha => {
        loadExerciciosByFichaId(ficha.id);
      });
    }
  }, [fichas, loadExerciciosByFichaId]);

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
      <View style={styles.header}>
        <Text style={styles.title}>Fichas de Treino</Text>
        <Text style={styles.subtitle}>{aluno?.nome || 'Aluno'}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Link href={{ pathname: "/modal-ficha", params: { alunoId: alunoId } }} asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="add-circle" size={20} color="#000" />
            <Text style={styles.primaryButtonText}>Adicionar Nova Ficha</Text>
          </TouchableOpacity>
        </Link>

        {fichas.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>Nenhuma ficha de treino encontrada</Text>
          </View>
        ) : (
          fichas.map((item) => (
            <View key={item.id} style={styles.fichaContainer}>
              <View style={styles.fichaHeader}>
                <Text style={styles.fichaTitle}>{item.nome}</Text>
                <View style={styles.fichaActions}>
                  <Link href={{ pathname: "/ficha/[id]/visualizar", params: { id: item.id } }} asChild>
                    <TouchableOpacity style={{
                      backgroundColor: '#4CAF50',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 8
                    }}>
                      <Ionicons name="eye" size={16} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Visualizar Ficha</Text>
                    </TouchableOpacity>
                  </Link>
                  <Link href={{ pathname: "/modal-copiar-ficha", params: { fichaId: item.id } }} asChild>
                    <TouchableOpacity style={styles.iconButton}>
                      <Ionicons name="copy-outline" size={20} color="#FFB700" />
                    </TouchableOpacity>
                  </Link>
                  <Link href={{ pathname: "/modal-ficha", params: { fichaId: item.id, alunoId: alunoId } }} asChild>
                    <TouchableOpacity style={styles.iconButton}>
                      <Ionicons name="pencil" size={20} color="#666" />
                    </TouchableOpacity>
                  </Link>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDeleteFicha(item.id)}
                  >
                    <Ionicons name="trash" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fichaDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="flag" size={16} color="#666" />
                  <Text style={styles.fichaDetail}>{item.objetivos || 'Sem objetivo definido'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={16} color="#666" />
                  <Text style={styles.fichaDetail}>{item.professor || 'Sem professor'}</Text>
                </View>
              </View>
            </View>
          ))
        )
        }
      </ScrollView >
    </View >
  );
}
