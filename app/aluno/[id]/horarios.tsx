import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAulasStore from '../../../store/useAulasStore';
import { AulaCalendario, RegraRecorrencia } from '../../../utils/novoCalendarioUtils';

export default function HorariosAlunoScreen() {
  const { id } = useLocalSearchParams();
  const alunoId = Number(id);
  const { obterAulasDoAluno, listarRegrasAtivas, encerrarRegraRecorrente } = useAulasStore();
  const [loading, setLoading] = useState(true);
  const [listaAulas, setListaAulas] = useState<AulaCalendario[]>([]);
  const [regrasAtivas, setRegrasAtivas] = useState<RegraRecorrencia[]>([]);

  // Range para histórico e previsões
  const hoje = new Date();
  const inicioHistorico = new Date(hoje.getFullYear() - 1, 0, 1); // 1 ano atrás
  const fimPrevisao = new Date(hoje.getFullYear() + 1, 11, 31); // 1 ano à frente

  // Função para formatar data para DD-MM-AAAA
  function formatarDataBR(dataISO: string) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}-${mes}-${ano}`;
  }

  function getNomeDia(dia: number) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia] || 'Dia Inválido';
  }

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (!alunoId) return;
      const [aulas, regras] = await Promise.all([
        obterAulasDoAluno(alunoId, inicioHistorico, fimPrevisao),
        listarRegrasAtivas(alunoId)
      ]);
      setListaAulas(aulas);
      setRegrasAtivas(regras);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [alunoId]);

  const handleExcluirRegra = (regraId: number) => {
    Alert.alert(
      "Excluir Recorrência",
      "Deseja encerrar esta regra recorrente? As aulas futuras não serão mais geradas, mas o histórico será mantido.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await encerrarRegraRecorrente(regraId);
              Alert.alert("Sucesso", "Regra encerrada.");
              carregarDados(); // Recarrega tudo
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir regra.");
            }
          }
        }
      ]
    );
  };

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
    return <View style={styles.container}><Text>Carregando dados...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {regrasAtivas.length > 0 && (
        <>
          <Text style={styles.title}>Regras de Recorrência (Ativas)</Text>
          {regrasAtivas.map(regra => (
            <View key={regra.id} style={styles.cardRegra}>
              <View>
                <Text style={styles.regraDia}>{getNomeDia(regra.dia_semana)} às {regra.hora_inicio}</Text>
                <Text style={styles.regraDetalhe}>{regra.duracao_minutos} min • Início: {formatarDataBR(regra.data_inicio_vigencia)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleExcluirRegra(regra.id)} style={styles.btnTrash}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

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
  cardRegra: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  regraDia: { fontWeight: 'bold', fontSize: 16, color: '#0d47a1' },
  regraDetalhe: { color: '#546e7a', fontSize: 12 },
  btnTrash: { padding: 8 },
  empty: { color: '#888', marginBottom: 8 },
}); 