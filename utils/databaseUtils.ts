import * as SQLite from 'expo-sqlite';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!databaseInstance) {
    try {
      databaseInstance = await SQLite.openDatabaseAsync('personaltrainer.db');
      console.log('Banco de dados aberto com sucesso');
    } catch (error) {
      console.error('Erro ao abrir banco de dados:', error);
      throw error;
    }
  }
  return databaseInstance;
};

export const closeDatabase = async () => {
  if (databaseInstance) {
    try {
      await databaseInstance.closeAsync();
      databaseInstance = null;
      console.log('Banco de dados fechado com sucesso');
    } catch (error) {
      console.error('Erro ao fechar banco de dados:', error);
    }
  }
};

export const checkAndFixDatabase = async () => {
  const db = await getDatabase();
  
  try {
    console.log('Verificando estrutura do banco de dados...');
    
    // Verificar se a tabela exercicios existe
    const tableExists = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='exercicios';");
    
    if (tableExists.length === 0) {
      console.log('Tabela exercicios não existe. Criando...');
      await createExerciciosTable(db);
    } else {
      // Verificar se a coluna ficha_id existe
      const columns = await db.getAllAsync("PRAGMA table_info(exercicios);");
      const hasFichaId = columns.some((col: any) => col.name === 'ficha_id');
      
      if (!hasFichaId) {
        console.log('Coluna ficha_id não encontrada. Recriando tabela exercicios...');
        await db.execAsync('DROP TABLE IF EXISTS exercicios;');
        await createExerciciosTable(db);
      }
    }
    
    console.log('Verificação do banco de dados concluída.');
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    throw error;
  }
};

const createExerciciosTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE exercicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ficha_id INTEGER,
      grupo_muscular TEXT,
      nome TEXT,
      maquina TEXT,
      series TEXT,
      repeticoes TEXT,
      carga TEXT,
      ajuste TEXT,
      observacoes TEXT,
      FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
    );
  `);
  console.log('Tabela exercicios criada com sucesso.');
};

export const resetDatabase = async () => {
  const db = await getDatabase();
  
  try {
    console.log('Resetando banco de dados...');
    
    // Dropar todas as tabelas
    await db.execAsync('DROP TABLE IF EXISTS frequencia;');
    await db.execAsync('DROP TABLE IF EXISTS exercicios;');
    await db.execAsync('DROP TABLE IF EXISTS treinos;');
    await db.execAsync('DROP TABLE IF EXISTS atividades_adicionais;');
    await db.execAsync('DROP TABLE IF EXISTS fichas;');
    await db.execAsync('DROP TABLE IF EXISTS alunos;');
    
    // Recriar todas as tabelas
    await db.execAsync(`
      CREATE TABLE alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        status TEXT,
        contato TEXT,
        foto_uri TEXT
      );

      CREATE TABLE fichas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER,
        nome TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        objetivos TEXT,
        observacoes TEXT,
        professor TEXT,
        descanso_padrao TEXT,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
      );

      CREATE TABLE treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ficha_id INTEGER,
        nome TEXT,
        FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
      );

      CREATE TABLE exercicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ficha_id INTEGER,
        grupo_muscular TEXT,
        nome TEXT,
        maquina TEXT,
        series TEXT,
        repeticoes TEXT,
        carga TEXT,
        ajuste TEXT,
        observacoes TEXT,
        FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
      );

      CREATE TABLE atividades_adicionais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ficha_id INTEGER,
        tipo TEXT,
        descricao TEXT,
        FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
      );

      CREATE TABLE frequencia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER,
        data TEXT,
        treino_id INTEGER,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE,
        FOREIGN KEY (treino_id) REFERENCES treinos (id) ON DELETE CASCADE
      );
    `);
    
    console.log('Banco de dados resetado com sucesso.');
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  const db = await getDatabase();
  
  try {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS alunos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          status TEXT,
          contato TEXT,
          foto_uri TEXT
        );

        CREATE TABLE IF NOT EXISTS fichas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER,
          nome TEXT,
          data_inicio TEXT,
          data_fim TEXT,
          objetivos TEXT,
          observacoes TEXT,
          professor TEXT,
          descanso_padrao TEXT,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS treinos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ficha_id INTEGER,
          nome TEXT,
          FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS exercicios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ficha_id INTEGER,
          grupo_muscular TEXT,
          nome TEXT,
          maquina TEXT,
          series TEXT,
          repeticoes TEXT,
          carga TEXT,
          ajuste TEXT,
          observacoes TEXT,
          FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS atividades_adicionais (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ficha_id INTEGER,
          tipo TEXT,
          descricao TEXT,
          FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS frequencia (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER,
          data TEXT,
          treino_id INTEGER,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE,
          FOREIGN KEY (treino_id) REFERENCES treinos (id) ON DELETE CASCADE
        );
      `);
      console.log('Banco de dados inicializado com sucesso.');
    });
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}; 