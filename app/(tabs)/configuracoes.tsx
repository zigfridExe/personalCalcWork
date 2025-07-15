import { Text, View, Button, Alert, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { limparAulasDuplicadas, listarDadosBanco, reiniciarConexaoBanco, testarBanco, regenerarAulasRecorrentes, verificarAulasNoBanco, limparTodasAulasRecorrentes, getDatabase, limparTodasAulas, limparTodasRRules, limparRecorrentesCompleto, deletarTodasAulasAvulsas, deletarTodasAulasSobrescritas, deletarTodasAulasCanceladas } from '../../utils/databaseUtils';
import useAulasStore from '../../store/useAulasStore';

export default function ConfiguracoesScreen() {
  const { resetDatabase, debugAlunos } = useAlunosStore();
  const { carregarAulas } = useAulasStore();

  const handleResetDatabase = () => {
    Alert.alert(
      "Resetar Banco de Dados",
      "ATENÇÃO: Isso irá apagar TODOS os dados do aplicativo. Tem certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Resetar", 
          onPress: async () => {
            try {
              await resetDatabase();
              Alert.alert("Sucesso", "Banco de dados resetado com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Erro ao resetar banco de dados: " + error);
            }
          }, 
          style: "destructive" 
        },
      ]
    );
  };

  const handleLimparAulasDuplicadas = () => {
    Alert.alert(
      "Limpar Aulas Duplicadas",
      "Isso irá remover aulas recorrentes duplicadas e com formato incorreto. Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Limpar", 
          onPress: async () => {
            try {
              await limparAulasDuplicadas();
              Alert.alert("Sucesso", "Aulas duplicadas e incorretas removidas com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Erro ao limpar aulas: " + error);
            }
          }
        },
      ]
    );
  };

  const handleRegenerarAulas = () => {
    Alert.alert(
      "Regenerar Aulas Recorrentes",
      "Isso irá remover TODAS as aulas recorrentes e criar novas com base nos horários padrão. Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Regenerar", 
          onPress: async () => {
            try {
              await regenerarAulasRecorrentes();
              Alert.alert("Sucesso", "Aulas recorrentes regeneradas com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Erro ao regenerar aulas: " + error);
            }
          }
        },
      ]
    );
  };

  const handleVisualizarDados = async () => {
    try {
      await listarDadosBanco();
      Alert.alert("Dados Listados", "Veja o console para visualizar todos os dados do banco!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao listar dados: " + error);
    }
  };

  const handleTestarBanco = async () => {
    try {
      const funcionando = await testarBanco();
      if (funcionando) {
        Alert.alert("✅ Banco OK", "O banco de dados está funcionando corretamente!");
      } else {
        Alert.alert("❌ Banco com Problema", "O banco de dados está com problemas. Tente reiniciar a conexão.");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao testar banco: " + error);
    }
  };

  const handleReiniciarConexao = async () => {
    try {
      await reiniciarConexaoBanco();
      Alert.alert("Sucesso", "Conexão com o banco reiniciada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao reiniciar conexão: " + error);
    }
  };

  const handleVerificarAulasNoBanco = async () => {
    try {
      await verificarAulasNoBanco();
      Alert.alert('Verificação concluída', 'Veja o console para detalhes das aulas e horários recorrentes!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao verificar aulas: ' + error);
    }
  };

  const handleLimpezaEmergencia = () => {
    Alert.alert(
      "🚨 LIMPEZA DE EMERGÊNCIA (APOCALIPSE)",
      "ATENÇÃO: Isso irá executar todas as limpezas possíveis: aulas duplicadas, RRULEs, recorrências e avulsas. O banco de aulas ficará praticamente vazio. Tem certeza que deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "APOCALIPSE!",
          style: "destructive",
          onPress: async () => {
            try {
              let log = '';
              const duplicadas = await limparAulasDuplicadas();
              log += `🧹 Duplicadas limpas: ${duplicadas || 'ok'}\n`;
              const rrules = await limparTodasRRules();
              log += `🧹 RRULEs limpas: ${rrules}\n`;
              const { limpas, deletadas } = await limparRecorrentesCompleto();
              log += `🧹 Limpeza completa: ${limpas} RRULEs limpas, ${deletadas} recorrentes deletadas\n`;
              const avulsas = await deletarTodasAulasAvulsas();
              log += `🗑️ Aulas avulsas deletadas: ${avulsas}\n`;
              await carregarAulas();
              Alert.alert("💥 APOCALIPSE CONCLUÍDA", log);
            } catch (error) {
              Alert.alert("❌ Erro", "Erro na limpeza apocalipse: " + error);
            }
          },
        },
      ]
    );
  };

  const handleLimparTodasAulas = () => {
    Alert.alert(
      'APAGAR TODAS AS AULAS',
      'ATENÇÃO: Isso irá remover TODAS as aulas do banco (recorrentes e avulsas). Esta ação não pode ser desfeita. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'APAGAR TUDO',
          style: 'destructive',
          onPress: async () => {
            try {
              const removidas = await limparTodasAulas();
              Alert.alert('✅ Limpeza Concluída', `Removidas ${removidas} aulas do banco!`);
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao apagar todas as aulas: ' + error);
            }
          },
        },
      ]
    );
  };

  const handleLimparTodasRRules = () => {
    Alert.alert(
      'Limpar TODAS as RRULEs',
      'Isso irá remover todas as regras de recorrência (RRULE) das aulas. O calendário não exibirá mais aulas recorrentes virtuais. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'LIMPAR RRULEs',
          style: 'destructive',
          onPress: async () => {
            try {
              const removidas = await limparTodasRRules();
              Alert.alert('✅ Limpeza Concluída', `RRULE removidas de ${removidas} aulas!`);
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao limpar RRULEs: ' + error);
            }
          },
        },
      ]
    );
  };

  const handleLimparRecorrentesCompleto = () => {
    Alert.alert(
      'Limpeza Completa de Recorrências',
      'Isso irá limpar todas as RRULEs e deletar todas as aulas recorrentes do banco. O calendário não exibirá mais recorrências virtuais. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'LIMPAR TUDO',
          style: 'destructive',
          onPress: async () => {
            try {
              const { limpas, deletadas } = await limparRecorrentesCompleto();
              await carregarAulas(); // Garante atualização da store
              Alert.alert('✅ Limpeza Completa', `RRULE limpas em ${limpas} aulas.\n${deletadas} aulas recorrentes deletadas!`);
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro na limpeza completa: ' + error);
            }
          },
        },
      ]
    );
  };

  const handleDeletarAulasAvulsas = () => {
    Alert.alert(
      'Deletar TODAS as Aulas Avulsas',
      'Isso irá remover todas as aulas avulsas do banco. As aulas recorrentes, sobrescritas e canceladas serão mantidas. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'DELETAR AVULSAS',
          style: 'destructive',
          onPress: async () => {
            try {
              const removidas = await deletarTodasAulasAvulsas();
              await carregarAulas();
              Alert.alert('✅ Limpeza Concluída', `Removidas ${removidas} aulas avulsas do banco!`);
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao deletar aulas avulsas: ' + error);
            }
          },
        },
      ]
    );
  };

  const handleDeletarAulasSobrescritas = () => {
    Alert.alert(
      'Deletar TODAS as Aulas Sobrescritas',
      'Isso irá remover todas as aulas sobrescritas do banco. As demais aulas serão mantidas. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'DELETAR SOBRESCRITAS',
          style: 'destructive',
          onPress: async () => {
            try {
              const removidas = await deletarTodasAulasSobrescritas();
              await carregarAulas();
              Alert.alert('✅ Limpeza Concluída', `Removidas ${removidas} aulas sobrescritas do banco!`);
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao deletar aulas sobrescritas: ' + error);
            }
          },
        },
      ]
    );
  };

  const handleDeletarAulasCanceladas = () => {
    Alert.alert(
      'Deletar TODAS as Aulas Canceladas',
      'Isso irá remover todas as aulas canceladas do banco. As demais aulas serão mantidas. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'DELETAR CANCELADAS',
          style: 'destructive',
          onPress: async () => {
            try {
              const removidas = await deletarTodasAulasCanceladas();
              await carregarAulas();
              Alert.alert('✅ Limpeza Concluída', `Removidas ${removidas} aulas canceladas do banco!`);
            } catch (error) {
              Alert.alert('❌ Erro', 'Erro ao deletar aulas canceladas: ' + error);
            }
          },
        },
      ]
    );
  };

  const handleLogColunasAlunos = async () => {
    try {
      const db = await getDatabase();
      const colunas = await db.getAllAsync('PRAGMA table_info(alunos);');
      console.log('Colunas da tabela alunos:', colunas);
      Alert.alert('Log gerado', 'Veja o console para as colunas da tabela alunos.');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao obter colunas: ' + error);
    }
  };

  const styles = StyleSheet.create({
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginTop: 8,
      marginBottom: 8,
    },
    buttonWrapper: {
      marginHorizontal: 4,
      flex: 1,
      minWidth: 150,
      maxWidth: 180,
      height: 48,
      justifyContent: 'center',
    },
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 30 }}>Configurações</Text>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="🔧 Testar Banco" onPress={handleTestarBanco} color="green" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="🔄 Reiniciar Conexão" onPress={handleReiniciarConexao} color="teal" />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="👁️ Visualizar Dados do Banco" onPress={handleVisualizarDados} color="blue" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="🔍 Verificar Aulas no Banco" onPress={handleVerificarAulasNoBanco} color="navy" />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="🧹 Limpar Aulas Duplicadas" onPress={handleLimparAulasDuplicadas} color="orange" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="🚨 LIMPEZA DE EMERGÊNCIA" onPress={handleLimpezaEmergencia} color="red" />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="🧹 Limpar TODAS as RRULEs" onPress={handleLimparTodasRRules} color="#8e24aa" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="🧹 Limpeza Completa de Recorrências" color="#F44336" onPress={handleLimparRecorrentesCompleto} />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="🔄 Regenerar Aulas Recorrentes" onPress={handleRegenerarAulas} color="purple" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="🔧 Debug Alunos" onPress={debugAlunos} color="gray" />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="📝 Log Colunas da Tabela Alunos" onPress={handleLogColunasAlunos} color="black" />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="🗑️ Resetar Banco (Debug)" onPress={handleResetDatabase} color="red" />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="🗑️ Deletar TODAS as Aulas Avulsas" color="#FF9800" onPress={handleDeletarAulasAvulsas} />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="🗑️ Deletar TODAS as Aulas Sobrescritas" color="#607D8B" onPress={handleDeletarAulasSobrescritas} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="🗑️ Deletar TODAS as Aulas Canceladas" color="#9E9E9E" onPress={handleDeletarAulasCanceladas} />
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="️ Apagar TODAS as Aulas" onPress={handleLimparTodasAulas} color="#b71c1c" />
        </View>
      </View>
    </View>
  );
}
