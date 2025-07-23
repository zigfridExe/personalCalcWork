import HorariosScreen from '../../../src/domains/aluno/screens/HorariosScreen';
export default HorariosScreen;    const key = (a: Aula) => `${a.data_aula}_${a.hora_inicio}`;
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