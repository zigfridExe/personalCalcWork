import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function AlunosScreen() {
  useEffect(() => {
    const db = SQLite.openDatabaseSync('personaltrainer.db');
    try {
      db.execSync('CREATE TABLE IF NOT EXISTS alunos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT);');
      
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
    <View style={styles.container}>
      <Text style={styles.title}>Alunos</Text>
      <Text>A base de dados SQLite foi inicializada. Veja o console.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
