
import { Text, View, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import useAlunosStore from '../../store/useAlunosStore';
import { limparAulasDuplicadas, listarDadosBanco, reiniciarConexaoBanco, testarBanco, regenerarAulasRecorrentes, verificarAulasNoBanco, deletarTodasAulasRecorrentes, getDatabase, limparTodasAulas, limparTodasRRules, limparRecorrentesCompleto, deletarTodasAulasAvulsas, deletarTodasAulasSobrescritas, migrarBancoCalendario, limparTodosHorariosRecorrentes } from '../../utils/databaseUtils';
import useAulasStore from '../../store/useAulasStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme } from '@/styles/theme';

async function logDiasAulasRecorrentes() {
  const db = await getDatabase();
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const recorrentes = await db.getAllAsync<any>('SELECT * FROM horarios_recorrentes');
  const aulas = await db.getAllAsync<any>('SELECT * FROM aulas');

  console.log('--- LOG DE DIAS DO CALENDÁRIO ---');
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const data = new Date(ano, mes, d);
    const dataISO = data.toISOString().slice(0, 10);
    const diaSemana = data.getDay();
    const temAula = aulas.some(a => a.data_aula === dataISO);
    const recorrentesDia = recorrentes.filter(r => Number(r.dia_semana) === diaSemana);
    console.log(
      `Dia: ${dataISO} (${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][diaSemana]}) | Tem aula: ${temAula ? 'SIM' : 'NÃO'} | Padrão recorrente: ${recorrentesDia.length > 0 ? 'SIM' : 'NÃO'} | IDs padrões: [${recorrentesDia.map(r => r.id).join(', ')}]`
    );
  }
  Alert.alert('Log gerado no console!');
}

// Componente Helper para Botões de Configuração
const ConfigButton = ({ title, onPress, color, variant = 'primary' }: { title: string, onPress: () => void, color?: string, variant?: 'primary' | 'danger' | 'info' }) => {
  let backgroundColor = theme.colors.primary;
  let textColor = theme.colors.background;

  if (variant === 'danger' || color === 'red' || color === '#F44336' || color === '#b71c1c') {
    backgroundColor = theme.colors.danger;
    textColor = '#fff';
  } else if (variant === 'info' || color === 'blue' || color === '#1976D2' || color === 'teal' || color === 'navy') {
    backgroundColor = theme.colors.card; // Usar tom de card/cinza para infos secundárias no contexto dark
    textColor = theme.colors.primary;
    // Ou usar borda
  } else if (color === 'gray') {
    backgroundColor = theme.colors.textSecondary;
    textColor = theme.colors.text;
  }

  // Override manual se necessário, mas tentando manter o padrão

  return (
    <TouchableOpacity
      style={{
        backgroundColor: backgroundColor,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        borderWidth: (variant === 'info' || backgroundColor === theme.colors.card) ? 1 : 0,
        borderColor: theme.colors.border
      }}
      onPress={onPress}
    >
      <Text style={{
        color: textColor,
        fontFamily: theme.fonts.title,
        fontSize: 14,
        textTransform: 'uppercase',
        textAlign: 'center'
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default function ConfiguracoesScreen() {
  const { resetDatabase, debugAlunos } = useAlunosStore();
  const { carregarCalendario } = useAulasStore();

  const reloadAulas = async () => {
    const hoje = new Date();
    await carregarCalendario(hoje.getMonth() + 1, hoje.getFullYear());
  };

  const dbName = 'personaltrainer.db';
  const dbPath = FileSystem.documentDirectory + 'SQLite/' + dbName;

  const handleExportarBackup = async () => {
    try {
      const exists = await FileSystem.getInfoAsync(dbPath);
      if (!exists.exists) {
        Alert.alert('Erro', 'Banco de dados não encontrado.');
        return;
      }
      const dest = FileSystem.documentDirectory + dbName;
      await FileSystem.copyAsync({ from: dbPath, to: dest });
      await Sharing.shareAsync(dest, { mimeType: 'application/octet-stream' });
      Alert.alert('Backup exportado!', 'Arquivo .db pronto para salvar ou compartilhar.');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao exportar backup: ' + e);
    }
  };

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
                const sqliteDir = FileSystem.documentDirectory + 'SQLite';
                const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
                if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(sqliteDir);
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
              await reloadAulas();
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
              await reloadAulas(); // Garante atualização da store
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
              await reloadAulas();
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
              await reloadAulas();
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
    sectionTitle: {
      fontSize: 24,
      marginBottom: 30,
      color: theme.colors.primary,
      fontFamily: theme.fonts.title
    },
    controlLabel: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 6,
      color: theme.colors.text
    },
    controlValue: {
      marginHorizontal: 16,
      fontSize: 18,
      color: theme.colors.primary,
      fontFamily: theme.fonts.title
    }
  });

  return (
    <>
      <ScreenHeader title="Configurações" />
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🔧 Testar Banco" onPress={handleTestarBanco} variant="primary" />
          </View>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🔄 Reiniciar Conexão" onPress={handleReiniciarConexao} variant="primary" />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="👁️ Visualizar Dados" onPress={handleVisualizarDados} variant="info" />
          </View>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🔍 Verificar Aulas" onPress={handleVerificarAulasNoBanco} variant="info" />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🧹 Limpar Duplicadas" onPress={handleLimparAulasDuplicadas} color="orange" />
          </View>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🚨 EMERGÊNCIA" onPress={handleLimpezaEmergencia} variant="danger" />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🧹 Limpar RRULEs" onPress={handleLimparTodasRRules} variant="primary" />
          </View>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🧹 Limpeza Completa" color="#F44336" onPress={handleLimparRecorrentesCompleto} variant="danger" />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🔄 Regenerar Recorrentes" onPress={handleRegenerarAulas} variant="primary" />
          </View>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🔧 Debug Alunos" onPress={debugAlunos} color="gray" />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="📝 Log Colunas" onPress={handleLogColunasAlunos} color="black" />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🗑️ Resetar Banco" onPress={handleResetDatabase} variant="danger" />
          </View>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🗑️ Deletar Avulsas" color="#FF9800" onPress={handleDeletarAulasAvulsas} />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="🗑️ Deletar Sobrescritas" color="#607D8B" onPress={handleDeletarAulasSobrescritas} />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <ConfigButton title="️ Apagar TODAS Aulas" onPress={handleLimparTodasAulas} variant="danger" />
          </View>
        </View>

        <View style={{ marginTop: 32 }}>
          <ConfigButton title="Exportar Backup (.db)" color="#1976D2" onPress={handleExportarBackup} />
          <View style={{ height: 12 }} />
          <ConfigButton title="Importar Backup (.db)" color="#FF9800" onPress={handleImportarBackup} />
        </View>

        <View style={{ marginVertical: 16 }}>
          <ConfigButton title="Rodar Migração do Calendário" color="#1976D2" onPress={handleMigrarCalendario} />
        </View>

        <View style={{ marginVertical: 20 }}>
          <Text style={styles.controlLabel}>Período de geração de aulas recorrentes (meses à frente):</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => lookAheadMeses > 1 && handleChangeLookAhead(lookAheadMeses - 1)} style={{ padding: 10, backgroundColor: theme.colors.card, borderRadius: 5 }}>
              <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' }}>-</Text>
            </TouchableOpacity>
            <Text style={styles.controlValue}>{lookAheadMeses}</Text>
            <TouchableOpacity onPress={() => handleChangeLookAhead(lookAheadMeses + 1)} style={{ padding: 10, backgroundColor: theme.colors.card, borderRadius: 5 }}>
              <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginVertical: 10 }}>
          <ConfigButton title="Log de Dias/Aulas (Console)" color="#1976D2" onPress={logDiasAulasRecorrentes} />
        </View>
      </ScrollView>
    </>
  );
}
