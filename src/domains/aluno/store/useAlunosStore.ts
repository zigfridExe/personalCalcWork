import { create } from 'zustand';
import { getDatabase, initializeDatabase as initDB, checkAndFixDatabase, resetDatabase as resetDB } from '../../../../utils/databaseUtils';

export interface Aluno {
  id: number;
  nome: string;
  contato?: string;
  data_nascimento?: string;
  fotoUri?: string;
}

export interface Medida {
  id?: number;
  aluno_id: number;
  data: Date;
  peso: number;
  altura: number;
  cintura?: number | null;
  quadril?: number | null;
}

interface AlunosState {
  alunos: Aluno[];
  addAluno: (nome: string, contato: string, data_nascimento: string, fotoUri?: string) => Promise<void>;
  updateAluno: (id: number, nome: string, contato: string, data_nascimento: string, fotoUri?: string) => Promise<void>;
  deleteAluno: (id: number) => Promise<void>;
  initializeDatabase: () => Promise<void>;
  resetDatabase: () => Promise<void>;
  debugAlunos: () => Promise<void>;
  registrarMedida: (medida: Medida) => Promise<void>;
  buscarMedidas: (aluno_id: number) => Promise<Medida[]>;
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
      const allRows = await db.getAllAsync<any>('SELECT * FROM alunos;');
      // Mapear foto_uri para fotoUri para compatibilidade com a interface
      const alunosMapeados = allRows.map((aluno: any) => ({
        id: aluno.id,
        nome: aluno.nome,
        contato: aluno.contato,
        data_nascimento: aluno.data_nascimento,
        fotoUri: aluno.foto_uri || aluno.fotoUri, // Suporte a ambos os formatos
      }));
      
      set({ alunos: alunosMapeados });
    } catch (error) {
      console.error('Erro ao inicializar o banco de dados:', error);
      throw error;
    }
  },

  addAluno: async (nome, contato, data_nascimento, fotoUri = '') => {
    try {
      const db = await getDatabase();
      const result = await db.runAsync(
        'INSERT INTO alunos (nome, contato, data_nascimento, foto_uri) VALUES (?, ?, ?, ?)',
        [nome, contato, data_nascimento, fotoUri]
      );
      
      if (result.lastInsertRowId) {
        const novoAluno: Aluno = {
          id: result.lastInsertRowId as number,
          nome,
          contato,
          data_nascimento,
          fotoUri,
        };
        
        set((state) => ({
          alunos: [...state.alunos, novoAluno],
        }));
      }
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      throw error;
    }
  },

  updateAluno: async (id, nome, contato, data_nascimento, fotoUri = '') => {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'UPDATE alunos SET nome = ?, contato = ?, data_nascimento = ?, foto_uri = ? WHERE id = ?',
        [nome, contato, data_nascimento, fotoUri, id]
      );
      
      set((state) => ({
        alunos: state.alunos.map((aluno) =>
          aluno.id === id ? { ...aluno, nome, contato, data_nascimento, fotoUri } : aluno
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  },

  deleteAluno: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM alunos WHERE id = ?', [id]);
    set((state) => ({
      alunos: state.alunos.filter((aluno) => aluno.id !== id),
    }));
  },

  resetDatabase: async () => {
    try {
      await resetDB();
      // Recarregar os alunos após o reset
      await get().initializeDatabase();
    } catch (error) {
      console.error('Erro ao resetar o banco de dados:', error);
      throw error;
    }
  },

  debugAlunos: async () => {
    try {
      const db = await getDatabase();
      const allRows = await db.getAllAsync('SELECT * FROM alunos;');
      console.log('=== DEBUG ALUNOS ===');
      console.log('Total de alunos:', allRows.length);
      console.log('Alunos no estado:', get().alunos.length);
      
      // Verificar se há diferenças entre o banco e o estado
      if (allRows.length !== get().alunos.length) {
        console.warn('AVISO: Número de alunos no banco difere do estado!');
        console.log('Alunos no banco:', allRows);
        console.log('Alunos no estado:', get().alunos);
      }
      
      // Verificar se há alunos sem nome
      const alunosSemNome = allRows.filter((aluno: any) => !aluno.nome || aluno.nome.trim() === '');
      if (alunosSemNome.length > 0) {
        console.warn('Alunos sem nome encontrados:', alunosSemNome);
      }
      
      console.log('=== FIM DEBUG ===');
    } catch (error) {
      console.error('Erro durante o debug:', error);
    }
  },

  registrarMedida: async (medida) => {
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO medidas (aluno_id, data, peso, altura, cintura, quadril) VALUES (?, ?, ?, ?, ?, ?)',
        [
          medida.aluno_id,
          medida.data.toISOString(),
          medida.peso,
          medida.altura,
          medida.cintura || null,
          medida.quadril || null,
        ]
      );
    } catch (error) {
      console.error('Erro ao registrar medida:', error);
      throw error;
    }
  },

  buscarMedidas: async (aluno_id) => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync(
        'SELECT * FROM medidas WHERE aluno_id = ? ORDER BY data DESC',
        [aluno_id]
      );
      
      return rows.map((row: any) => ({
        id: row.id,
        aluno_id: row.aluno_id,
        data: new Date(row.data),
        peso: row.peso,
        altura: row.altura,
        cintura: row.cintura,
        quadril: row.quadril,
      }));
    } catch (error) {
      console.error('Erro ao buscar medidas:', error);
      throw error;
    }
  },
}));

export default useAlunosStore;
