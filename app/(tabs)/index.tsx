import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import { Text } from 'react-native';

export default function TabOneScreen() {
  useEffect(() => {
    const db = SQLite.openDatabaseSync('personaltrainer.db');
    try {
      db.execSync('CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT);');
      
      // Verifica se a tabela já tem algum aluno para não inserir duplicados
      const countResult = db.getFirstSync<{ 'COUNT(*)': number }>('SELECT COUNT(*) FROM alunos;');
      const count = countResult ? countResult['COUNT(*)'] : 0;

      if (count === 0) {
        db.runSync('INSERT INTO alunos (nome) VALUES (?);', 'Primeiro Aluno');
        console.log('Primeiro aluno inserido.');
      }
      
      const rows = db.getAllSync('SELECT * FROM alunos;');
      console.log('Alunos cadastrados:', rows);
    } catch (error) {
      console.error('Erro ao interagir com o banco de dados:', error);
    }
  }, []);

  return (
    <Text>SQLite integrado! Veja o console para teste de banco.</Text>
  );
} 