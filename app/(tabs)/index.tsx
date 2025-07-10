import * as SQLite from 'expo-sqlite';
import React, { useEffect } from 'react';
import { Text } from 'react-native';

export default function TabOneScreen() {
  useEffect(() => {
    async function setupDatabase() {
      const db = await SQLite.openDatabaseAsync('personaltrainer.db');
      
      await db.withTransactionAsync(async () => {
        await db.execAsync(
          'CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT);'
        );

        await db.runAsync('INSERT INTO alunos (nome) VALUES (?);', 'Primeiro Aluno');

        const allRows = await db.getAllAsync('SELECT * FROM alunos;');
        console.log('Alunos:', allRows);
      });
    }

    setupDatabase();
  }, []);

  return (
    <Text>SQLite integrado! Veja o console para teste de banco.</Text>
  );
} 