import { create } from 'zustand';
import { getDatabase, initializeDatabase as initDB, checkAndFixDatabase, resetDatabase as resetDB } from '../utils/databaseUtils';

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
  resetDatabase: () => Promise<void>;
}

const useAlunosStore = create<AlunosState>((set, get) => ({
  alunos: [],
  initializeDatabase: async () => {
    try {
      // Primeiro, verificar e corrigir problemas no banco
      await checkAndFixDatabase();
      
      // Inicializar o banco
      await initDB();
      
      // Carregar alunos
      const db = await getDatabase();
      const allRows = await db.getAllAsync<Aluno>('SELECT * FROM alunos;');
      set({ alunos: allRows });
    } catch (e) {
      console.error('Erro ao inicializar banco de dados:', e);
    }
  },
  addAluno: async (nome, status = '', contato = '', fotoUri = '') => {
    const { initializeDatabase } = get();
    try {
      console.log('addAluno - Inicializando banco de dados...');
      await initializeDatabase();
      const db = await getDatabase();
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
    const db = await getDatabase();
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
    const db = await getDatabase();
    await db.runAsync('DELETE FROM alunos WHERE id = ?;', id);
    set((state) => ({ alunos: state.alunos.filter((aluno) => aluno.id !== id) }));
  },
  resetDatabase: async () => {
    try {
      await resetDB();
      console.log('resetDatabase - Banco de dados resetado.');
      await get().initializeDatabase(); // Re-initialize the database
    } catch (error) {
      console.error('resetDatabase - Erro ao resetar banco:', error);
    }
  },
}));

// Inicializa o banco de dados na primeira vez que o store é usado.
// Removendo a inicialização automática para evitar problemas
export default useAlunosStore;
