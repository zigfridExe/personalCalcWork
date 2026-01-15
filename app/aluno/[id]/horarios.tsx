import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import useAulasStore from '../../../store/useAulasStore';
import { AulaCalendario } from '../../../utils/novoCalendarioUtils';

export default function HorariosAlunoScreen() {
  const { id } = useLocalSearchParams();
  const alunoId = Number(id);
  const { obterAulasDoAluno } = useAulasStore();
  const [loading, setLoading] = useState(true);
  const [listaAulas, setListaAulas] = useState<AulaCalendario[]>([]);

  // Range para histórico e previsões
  const hoje = new Date();
  const inicioHistorico = new Date(hoje.getFullYear() - 1, 0, 1); // 1 ano atrás
  const fimPrevisao = new Date(hoje.getFullYear() + 1, 11, 31); // 1 ano à frente

  // Função para formatar data para DD-MM-AAAA
  function formatarDataBR(dataISO: string) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}-${mes}-${ano}`;
  }

  useEffect(() => {
    let cancelado = false;
    const carregar = async () => {
      setLoading(true);
      try {
        if (!alunoId) return;
        const aulas = await obterAulasDoAluno(alunoId, inicioHistorico, fimPrevisao);
        if (!cancelado) setListaAulas(aulas);
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    carregar();
    return () => { cancelado = true; };
  }, [alunoId]);

  // Aulas Futuras (a partir de hoje)
  const aulasAtivas = useMemo(() => {
    const hojeStr = hoje.toISOString().slice(0, 10);
    return listaAulas
      .filter(a => a.data >= hojeStr && a.status !== 'CANCELADA')
      .slice(0, 15); // Próximas 15 aulas
  }, [listaAulas]);

  // Histórico (passado)
  const aulasHistorico = useMemo(() => {
    const hojeStr = hoje.toISOString().slice(0, 10);
    return listaAulas
      .filter(a => a.data < hojeStr)
      .sort((a, b) => b.data.localeCompare(a.data) || b.hora.localeCompare(a.hora)); // Decrescente
  }, [listaAulas]);

  // Resumo Anual
  const resumo = useMemo(() => {
    const ano = hoje.getFullYear();
    const aulasAno = listaAulas.filter(a => a.data.startsWith(`${ano}-`));
    return {
      presencas: aulasAno.filter(a => a.status === 'REALIZADA').length,
      faltas: aulasAno.filter(a => a.status === 'FALTA').length,
      canceladas: aulasAno.filter(a => a.status === 'CANCELADA').length,
      total: aulasAno.length,
    };
  }, [listaAulas, hoje]);

  if (loading) {
    return <View style={styles.container}><Text>Carregando aulas...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Próximas Aulas</Text>
      {aulasAtivas.length === 0 ? <Text style={styles.empty}>Nenhuma aula futura agendada.</Text> : aulasAtivas.map(a => (
        <View key={a.key} style={styles.card}>
          <Text>{formatarDataBR(a.data)} {a.hora} - {a.status} {a.observacoes ? `(${a.observacoes})` : ''}</Text>
        </View>
      ))}

      <Text style={styles.title}>Histórico Completo</Text>
      {aulasHistorico.length === 0 ? <Text style={styles.empty}>Nenhuma aula no histórico.</Text> : aulasHistorico.map(a => (
        <View key={a.key} style={styles.card}>
          <Text>{formatarDataBR(a.data)} {a.hora} - {a.status} {a.observacoes ? `(${a.observacoes})` : ''}</Text>
        </View>
      ))}

      <Text style={styles.title}>Resumo Anual ({hoje.getFullYear()})</Text>
      <View style={styles.card}>
        <Text>Presenças: {resumo.presencas}</Text>
        <Text>Faltas: {resumo.faltas}</Text>
        <Text>Canceladas: {resumo.canceladas}</Text>
        <Text>Total de aulas: {resumo.total}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, elevation: 1 },
  empty: { color: '#888', marginBottom: 8 },
}); 