import { Text, View, Button, Alert, ScrollView } from 'react-native';
import useAlunosStore from '../../store/useAlunosStore';
import { limparAulasDuplicadas, listarDadosBanco, reiniciarConexaoBanco, testarBanco, regenerarAulasRecorrentes, verificarAulasNoBanco, limparTodasAulasRecorrentes, getDatabase, limparTodasAulas, limparTodasRRules, limparRecorrentesCompleto, deletarTodasAulasAvulsas, deletarTodasAulasSobrescritas, migrarBancoCalendario, limparTodosHorariosRecorrentes } from '../../utils/databaseUtils';
import useAulasStore from '../../store/useAulasStore';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import configuracoesStyles from '../../styles/configuracoesStyles';

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
      Alert.alert('Backup exportado para Downloads!');
    } catch (e) {
      Alert.alert('Erro ao exportar backup.');
    }
  };

  return (
    <ScrollView style={configuracoesStyles.container}>
      <Text style={configuracoesStyles.title}>Configurações</Text>
      <Button title="Exportar Backup" onPress={handleExportarBackup} />
      {/* Adicione aqui outros botões e funções conforme o original */}
    </ScrollView>
  );
}
