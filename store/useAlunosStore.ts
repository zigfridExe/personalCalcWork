import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';

interface Aluno {
  id: number;
  nome: string;
  status?: string;
  contato?: string;
  fotoUri?: string;
}

interface AlunosState {
  alunos: Aluno[];
  addAluno: (nome: string, status?: string, contato?: string, fotoUri?: string) => Promise<void>;
  updateAluno: (id: number, nome: string, status?: string, contato?: string, fotoUri?: string) => Promise<void>;
  deleteAluno: (id: number) => Promise<void>;
  initializeDatabase: () => Promise<void>;
}

const useAlunosStore = create<AlunosState>((set, get) => ({
  alunos: [],
  initializeDatabase: async () => {
    const db = await SQLite.openDatabaseAsync('personaltrainer.db');
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
        console.log('Tabela alunos criada ou já existia.');
      });
    } catch (e) {
      console.error('Erro ao criar/verificar tabela alunos:', e);
    }
    const allRows = await db.getAllAsync<Aluno>('SELECT * FROM alunos;');
    set({ alunos: allRows });
  },
  addAluno: async (nome, status = '', contato = '', fotoUri = '') => {
    const { initializeDatabase } = get();
    try {
      console.log('addAluno - Inicializando banco de dados...');
      await initializeDatabase();
      const db = await SQLite.openDatabaseAsync('personaltrainer.db');
      if (!db) {
        console.error('addAluno - Database object is null or undefined.');
        return;
      }
      const result = await db.runAsync('INSERT INTO alunos (nome, status, contato, foto_uri) VALUES (?, ?, ?, ?);', nome, status, contato, fotoUri);
      console.log('addAluno - Resultado DB:', result);
      const newAluno = { id: result.lastInsertRowId, nome, status, contato, fotoUri };
      set((state) => {
        const updatedAlunos = [...state.alunos, newAluno];
        console.log('addAluno - Novo estado alunos:', updatedAlunos);
        return { alunos: updatedAlunos };
      });
    } catch (error) {
      console.error('addAluno - Erro ao adicionar aluno:', error);
      throw error;
    }
  },
  updateAluno: async (id, nome, status = '', contato = '', fotoUri = '') => {
    const db = await SQLite.openDatabaseAsync('personaltrainer.db');
    try {
      await db.runAsync('UPDATE alunos SET nome = ?, status = ?, contato = ?, foto_uri = ? WHERE id = ?;', nome, status, contato, fotoUri, id);
      console.log('updateAluno - Aluno atualizado no DB.');
      set((state) => {
        const updatedAlunos = state.alunos.map((aluno) => (aluno.id === id ? { ...aluno, nome, status, contato, fotoUri } : aluno));
        console.log('updateAluno - Novo estado alunos:', updatedAlunos);
        return { alunos: updatedAlunos };
      });
    } catch (error) {
      console.error('updateAluno - Erro ao atualizar aluno:', error);
    }
  },
  deleteAluno: async (id) => {
    const db = await SQLite.openDatabaseAsync('personaltrainer.db');
    await db.runAsync('DELETE FROM alunos WHERE id = ?;', id);
    set((state) => ({ alunos: state.alunos.filter((aluno) => aluno.id !== id) }));
  },
}));

// Inicializa o banco de dados na primeira vez que o store é usado.
useAlunosStore.getState().initializeDatabase();

export default useAlunosStore;
