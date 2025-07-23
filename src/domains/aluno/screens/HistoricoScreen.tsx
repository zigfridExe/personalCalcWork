import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import useHistoricoStore from '../store/useHistoricoStore';
import useAlunosStore from '../store/useAlunosStore';

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
    });
  };

  if (loading) {
    return <Text>Carregando histórico...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Histórico do Aluno</Text>
      {aluno && <Text style={styles.subtitle}>Aluno: {aluno.nome}</Text>}
      {historicos.map((h: any) => (
        <View key={h.id} style={styles.historicoItem}>
          <Text style={styles.historicoTitle}>Ficha: {h.ficha_nome}</Text>
          <Text>Data: {formatarData(h.data_inicio)} - {formatarData(h.data_fim)}</Text>
          <Text>Duração: {h.duracao_minutos} minutos</Text>
          {/* Exibir exercícios e séries aqui */}
        </View>
      ))}
      {/* Exibir histórico de medidas, se necessário */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  historicoItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historicoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
});
