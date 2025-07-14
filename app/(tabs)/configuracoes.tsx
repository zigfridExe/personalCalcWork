import { Text, View, Button, Alert } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { limparAulasDuplicadas, listarDadosBanco, reiniciarConexaoBanco, testarBanco, regenerarAulasRecorrentes, verificarAulasNoBanco, limparTodasAulasRecorrentes } from '../../utils/databaseUtils';

export default function ConfiguracoesScreen() {
  const { resetDatabase, debugAlunos } = useAlunosStore();

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
      "🚨 LIMPEZA DE EMERGÊNCIA",
      "ATENÇÃO: Isso irá remover TODAS as aulas recorrentes do banco. Use apenas se houver problemas graves de duplicação. Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "LIMPAR TUDO", 
          onPress: async () => {
            try {
              const removidas = await limparTodasAulasRecorrentes();
              Alert.alert("✅ Limpeza Concluída", `Removidas ${removidas} aulas recorrentes!`);
            } catch (error) {
              Alert.alert("❌ Erro", "Erro na limpeza: " + error);
            }
          },
          style: "destructive"
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 30 }}>Configurações</Text>
      
      <Button title="🔧 Testar Banco" onPress={handleTestarBanco} color="green" />
      
      <View style={{ height: 20 }} />
      
      <Button title="🔄 Reiniciar Conexão" onPress={handleReiniciarConexao} color="teal" />
      
      <View style={{ height: 20 }} />
      
      <Button title="👁️ Visualizar Dados do Banco" onPress={handleVisualizarDados} color="blue" />
      <View style={{ height: 20 }} />
      <Button title="🔍 Verificar Aulas no Banco" onPress={handleVerificarAulasNoBanco} color="navy" />
      
      <View style={{ height: 20 }} />
      
      <Button title="🧹 Limpar Aulas Duplicadas" onPress={handleLimparAulasDuplicadas} color="orange" />
      
      <View style={{ height: 20 }} />
      
      <Button title="🚨 LIMPEZA DE EMERGÊNCIA" onPress={handleLimpezaEmergencia} color="red" />
      
      <View style={{ height: 20 }} />
      
      <Button title="🔄 Regenerar Aulas Recorrentes" onPress={handleRegenerarAulas} color="purple" />
      
      <View style={{ height: 20 }} />
      
      <Button title="🔧 Debug Alunos" onPress={debugAlunos} color="gray" />
      
      <View style={{ height: 20 }} />
      
      <Link href="/calendario/debug" asChild>
        <Button title="🔍 Debug Calendário" color="brown" />
      </Link>
      
      <View style={{ height: 20 }} />
      
      <Button title="🗑️ Resetar Banco (Debug)" onPress={handleResetDatabase} color="red" />
    </View>
  );
}
