import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import useAulasStore, { Aula } from '../../../store/useAulasStore';

export default function HorariosAlunoScreen() {
  const { id } = useLocalSearchParams();
  const alunoId = Number(id);
  const { aulas, carregarAulas } = useAulasStore();
  const [loading, setLoading] = useState(true);

  // Range de datas: hoje até 15 dias à frente
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 15);
  const inicioStr = inicio.toISOString().slice(0, 10);
  const fimStr = fim.toISOString().slice(0, 10);

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
        // Busca todas as aulas recorrentes do aluno (sem filtro de data)
        await carregarAulas(undefined, undefined, alunoId);
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    if (alunoId) carregar();
    return () => { cancelado = true; };
  }, [alunoId, carregarAulas]);

  // Substituir o filtro aulasAtivas por uma lógica que prioriza exceções/cancelamentos sobre recorrentes geradas
  const aulasAtivas = useMemo(() => {
    // Filtra aulas do range
    const aulasRange = aulas.filter(a => a.aluno_id === alunoId && a.data_aula >= inicioStr && a.data_aula <= fimStr);
    // Agrupa por data/hora
    const key = (a: Aula) => `${a.data_aula}_${a.hora_inicio}`;
    const map = new Map<string, Aula>();
    for (const aula of aulasRange) {
      const k = key(aula);
      if (map.has(k)) continue;
      if (aula.tipo_aula === 'EXCECAO_HORARIO' || aula.tipo_aula === 'EXCECAO_CANCELAMENTO') {
        map.set(k, aula);
      } else if (aula.tipo_aula === 'RECORRENTE_GERADA') {
        if (!map.has(k)) map.set(k, aula);
      } else {
        map.set(k, aula);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.data_aula.localeCompare(b.data_aula) || a.hora_inicio.localeCompare(b.hora_inicio));
  }, [aulas, alunoId, inicioStr, fimStr]);

  // Agrupa aulas passadas (até hoje), normalizando recorrentes
  const aulasHistorico = useMemo(() => {
    const recorrentes = aulas.filter(a => a.aluno_id === alunoId && a.tipo_aula === 'RECORRENTE_GERADA');
    const avulsas = aulas.filter(a => a.aluno_id === alunoId && a.tipo_aula === 'AVULSA' && a.data_aula < inicioStr);
    const ocorrenciasRecorrentes = recorrentes.flatMap(aula => {
      if (!aula.rrule) return [];
      try {
        const rule = rrulestr(aula.rrule);
        const datas = rule.between(new Date(aula.data_aula), inicio, true);
        return datas.map(dataObj => ({
          ...aula,
          data_aula: dataObj.toISOString().slice(0, 10),
        }));
      } catch {
        return [];
      }
    });
    // Remove duplicatas (caso sobrescrita/cancelada)
    const todas = [...ocorrenciasRecorrentes, ...avulsas];
    return todas.sort((a, b) => b.data_aula.localeCompare(a.data_aula) || b.hora_inicio.localeCompare(a.hora_inicio));
  }, [aulas, alunoId, inicio, inicioStr]);

  // Resumo anual (mantém igual)
  const resumo = useMemo(() => {
    const ano = hoje.getFullYear();
    const aulasAno = aulas.filter(a => a.aluno_id === alunoId && a.data_aula.startsWith(`${ano}-`));
    return {
      presencas: aulasAno.filter(a => a.presenca === 1).length,
      faltas: aulasAno.filter(a => a.presenca === 2).length,
      canceladas: aulasAno.filter(a => a.presenca === 3).length,
      total: aulasAno.length,
    };
  }, [aulas, alunoId, hoje]);

  if (loading) {
    return <View style={styles.container}><Text>Carregando aulas...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Aulas Ativas (próx. 15 dias)</Text>
      {aulasAtivas.length === 0 ? <Text style={styles.empty}>Nenhuma aula ativa agendada.</Text> : aulasAtivas.map(a => (
        <View key={a.data_aula + a.hora_inicio + a.tipo_aula} style={styles.card}>
          <Text>{formatarDataBR(a.data_aula)} {a.hora_inicio} - {a.tipo_aula} - Agendada</Text>
        </View>
      ))}

      <Text style={styles.title}>Histórico Completo</Text>
      {aulasHistorico.length === 0 ? <Text style={styles.empty}>Nenhuma aula no histórico.</Text> : aulasHistorico.map(a => (
        <View key={a.data_aula + a.hora_inicio + a.tipo_aula} style={styles.card}>
          <Text>{formatarDataBR(a.data_aula)} {a.hora_inicio} - {a.tipo_aula} - {a.presenca === 1 ? 'Presente' : a.presenca === 2 ? 'Faltou' : a.presenca === 3 ? 'Cancelada' : 'Agendada'}</Text>
        </View>
      ))}

      <Text style={styles.title}>Resumo Anual</Text>
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