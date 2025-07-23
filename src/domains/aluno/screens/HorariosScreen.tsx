import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAulasStore, { Aula } from '../../store/useAulasStore';
import horariosStyles from '../../styles/horariosStyles';

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

  // (Removido: lógica de rrule e normalização de recorrentes pois não está mais em uso)
  // Caso precise de histórico de aulas passadas, basta filtrar aulas anteriores a hoje:
  const aulasHistorico = useMemo(() => {
    return aulas
      .filter((a: Aula) => a.aluno_id === alunoId && a.data_aula < inicioStr)
      .sort((a: Aula, b: Aula) => b.data_aula.localeCompare(a.data_aula) || b.hora_inicio.localeCompare(a.hora_inicio));
  }, [aulas, alunoId, inicioStr]);

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
    return <View style={horariosStyles.container}><Text>Carregando aulas...</Text></View>;
  }

  return (
    <ScrollView style={horariosStyles.container}>
      <Text style={horariosStyles.title}>Aulas Ativas (próx. 15 dias)</Text>
      {aulasAtivas.length === 0 ? <Text style={horariosStyles.empty}>Nenhuma aula ativa agendada.</Text> : aulasAtivas.map(a => (
        <View key={a.data_aula + a.hora_inicio + a.tipo_aula} style={horariosStyles.card}>
          <Text>{formatarDataBR(a.data_aula)} {a.hora_inicio} - {a.tipo_aula} - Agendada</Text>
        </View>
      ))}

      <Text style={horariosStyles.title}>Histórico Completo</Text>
      {aulasHistorico.length === 0 ? <Text style={horariosStyles.empty}>Nenhuma aula no histórico.</Text> : aulasHistorico.map(a => (
        <View key={a.data_aula + a.hora_inicio + a.tipo_aula} style={horariosStyles.card}>
          <Text>{formatarDataBR(a.data_aula)} {a.hora_inicio} - {a.tipo_aula} - {a.presenca === 1 ? 'Presente' : a.presenca === 2 ? 'Faltou' : a.presenca === 3 ? 'Cancelada' : 'Agendada'}</Text>
        </View>
      ))}

      <Text style={horariosStyles.title}>Resumo Anual</Text>
      <View style={horariosStyles.card}>
        <Text>Presenças: {resumo.presencas}</Text>
        <Text>Faltas: {resumo.faltas}</Text>
        <Text>Canceladas: {resumo.canceladas}</Text>
        <Text>Total de aulas: {resumo.total}</Text>
      </View>
    </ScrollView>
  );
}
