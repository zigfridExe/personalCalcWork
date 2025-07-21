import { Text, View, Button, Alert, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { limparAulasDuplicadas, listarDadosBanco, reiniciarConexaoBanco, testarBanco, regenerarAulasRecorrentes, verificarAulasNoBanco, limparTodasAulasRecorrentes, getDatabase, limparTodasAulas, limparTodasRRules, limparRecorrentesCompleto, deletarTodasAulasAvulsas, deletarTodasAulasSobrescritas, migrarBancoCalendario, limparTodosHorariosRecorrentes } from '../../utils/databaseUtils';
import useAulasStore from '../../store/useAulasStore';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function logDiasAulasRecorrentes() {
  const db = await getDatabase();
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  // Buscar padrões recorrentes
  const recorrentes = await db.getAllAsync<any>('SELECT * FROM horarios_recorrentes');
  // Buscar aulas materializadas
  const aulas = await db.getAllAsync<any>('SELECT * FROM aulas');

  console.log('--- LOG DE DIAS DO CALENDÁRIO ---');
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const data = new Date(ano, mes, d);
    const dataISO = data.toISOString().slice(0, 10);
    const diaSemana = data.getDay();
    const temAula = aulas.some(a => a.data_aula === dataISO);
    // Padrões recorrentes para esse dia da semana
    const recorrentesDia = recorrentes.filter(r => Number(r.dia_semana) === diaSemana);
    console.log(
      `Dia: ${dataISO} (${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][diaSemana]}) | Tem aula: ${temAula ? 'SIM' : 'NÃO'} | Padrão recorrente: ${recorrentesDia.length > 0 ? 'SIM' : 'NÃO'} | IDs padrões: [${recorrentesDia.map(r => r.id).join(', ')}]`
    );
  }
  Alert.alert('Log gerado no console!');
}

export default function ConfiguracoesScreen() {
  const { resetDatabase, debugAlunos } = useAlunosStore();
  const { carregarAulas } = useAulasStore();

  // Caminho do banco no Expo SQLite
  const dbName = 'personaltrainer.db';
  const dbPath = FileSystem.documentDirectory + 'SQLite/' + dbName;

  // Exportar backup
  const handleExportarBackup = async () => {
    try {
      // Garante que o arquivo existe
      const exists = await FileSystem.getInfoAsync(dbPath);
      if (!exists.exists) {
        Alert.alert('Erro', 'Banco de dados não encontrado.');
        return;
      }
      // Copia para Downloads
      const dest = FileSystem.documentDirectory + dbName;
      await FileSystem.copyAsync({ from: dbPath, to: dest });
      // Compartilhar
      await Sharing.shareAsync(dest, { mimeType: 'application/octet-stream' });
      Alert.alert('Backup exportado!', 'Arquivo .db pronto para salvar ou compartilhar.');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar backup: ' + e);
    }
  };

  // Importar backup
  const handleImportarBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/octet-stream', copyToCacheDirectory: true });
      if (!result || result.canceled || !result.assets || result.assets.length === 0) return;
      const fileUri = result.assets[0].uri;
      Alert.alert(
        'Restaurar Backup',
        'Isso irá substituir TODOS os dados atuais pelo backup selecionado. Tem certeza?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: async () => {
              try {
                // Garante pasta SQLite
                const sqliteDir = FileSystem.documentDirectory + 'SQLite';
                const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
                if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(sqliteDir);
                // Copia o arquivo selecionado para o local do banco
                await FileSystem.copyAsync({ from: fileUri, to: dbPath });
                Alert.alert('Backup restaurado!', 'Reinicie o app para garantir que tudo foi carregado corretamente.');
              } catch (e) {
                Alert.alert('Erro', 'Falha ao restaurar backup: ' + e);
              }
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert('Erro', 'Falha ao importar backup: ' + e);
    }
  };

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
      "ATENÇÃO: Isso irá remover absolutamente TODAS as aulas e TODOS os padrões recorrentes do banco. O banco ficará vazio para recomeçar do zero. Tem certeza que deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "APOCALIPSE!",
          style: "destructive",
          onPress: async () => {
            try {
              const removidas = await limparTodasAulas();
              const padroesRemovidos = await limparTodosHorariosRecorrentes();
              await carregarAulas();
              Alert.alert("💥 APOCALIPSE CONCLUÍDA", `Removidas ${removidas} aulas e ${padroesRemovidos} padrões recorrentes do banco!`);
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
              const { deletadas } = await limparRecorrentesCompleto();
              await carregarAulas(); // Garante atualização da store
              Alert.alert('✅ Limpeza Completa', `${deletadas} aulas recorrentes deletadas!`);
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

  const handleMigrarCalendario = async () => {
    try {
      await migrarBancoCalendario();
      Alert.alert('Migração concluída', 'Banco de dados do calendário atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao migrar banco do calendário: ' + error);
    }
  };

  // Estado para look-ahead
  const [lookAheadMeses, setLookAheadMeses] = useState<number>(1);
  useEffect(() => {
    AsyncStorage.getItem('lookAheadMeses').then(val => {
      if (val) setLookAheadMeses(Number(val));
    });
  }, []);
  const handleChangeLookAhead = async (novo: number) => {
    setLookAheadMeses(novo);
    await AsyncStorage.setItem('lookAheadMeses', String(novo));
    Alert.alert('Configuração salva', `Aulas recorrentes serão geradas para os próximos ${novo} meses.`);
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
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
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
      </View>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button title="️ Apagar TODAS as Aulas" onPress={handleLimparTodasAulas} color="#b71c1c" />
        </View>
      </View>

      <View style={{ marginTop: 32 }}>
        <Button title="Exportar Backup (.db)" color="#1976D2" onPress={handleExportarBackup} />
        <View style={{ height: 12 }} />
        <Button title="Importar Backup (.db)" color="#FF9800" onPress={handleImportarBackup} />
      </View>

      <View style={{ marginVertical: 16 }}>
        <Button title="Rodar Migração do Calendário" color="#1976D2" onPress={handleMigrarCalendario} />
      </View>

      <View style={{ marginVertical: 20 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Período de geração de aulas recorrentes (meses à frente):</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button title="-" onPress={() => lookAheadMeses > 1 && handleChangeLookAhead(lookAheadMeses - 1)} />
          <Text style={{ marginHorizontal: 16, fontSize: 18 }}>{lookAheadMeses}</Text>
          <Button title="+" onPress={() => handleChangeLookAhead(lookAheadMeses + 1)} />
        </View>
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Log de Dias/Aulas Recorrentes (Console)" color="#1976D2" onPress={logDiasAulasRecorrentes} />
      </View>
    </ScrollView>
  );
}
