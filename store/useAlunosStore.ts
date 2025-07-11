import { create } from 'zustand';
import { getDatabase, initializeDatabase as initDB, checkAndFixDatabase, resetDatabase as resetDB } from '../utils/databaseUtils';

interface Aluno {
  id: number;
  nome: string;
  status?: string;
  contato?: string;
  fotoUri?: string;
  lembrete_hidratacao_minutos?: number | null;
  peso?: number | null;
  altura?: number | null;
  imc?: number | null;
}

interface Medida {
  id?: number;
  aluno_id: number;
  data: string;
  peso: number;
  altura: number;
  cintura?: number | null;
  quadril?: number | null;
}

interface AlunosState {
  alunos: Aluno[];
  addAluno: (nome: string, status?: string, contato?: string, fotoUri?: string, lembreteHidratacaoMinutos?: number | null, peso?: number | null, altura?: number | null, imc?: number | null) => Promise<void>;
  updateAluno: (id: number, nome: string, status?: string, contato?: string, fotoUri?: string, lembreteHidratacaoMinutos?: number | null, peso?: number | null, altura?: number | null, imc?: number | null) => Promise<void>;
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
        ...aluno,
        fotoUri: aluno.foto_uri,
        lembrete_hidratacao_minutos: aluno.lembrete_hidratacao_minutos ?? null
      }));
      set({ alunos: alunosMapeados });
    } catch (e) {
      console.error('Erro ao inicializar banco de dados:', e);
    }
  },
  addAluno: async (nome, status = '', contato = '', fotoUri = '', lembreteHidratacaoMinutos: number | null = null, peso: number | null = null, altura: number | null = null, imc: number | null = null) => {
    const { initializeDatabase } = get();
    try {
      console.log('addAluno - Inicializando banco de dados...');
      await initializeDatabase();
      const db = await getDatabase();
      const result = await db.runAsync('INSERT INTO alunos (nome, status, contato, foto_uri, lembrete_hidratacao_minutos, peso, altura, imc) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', nome, status, contato, fotoUri, lembreteHidratacaoMinutos, peso, altura, imc);
      console.log('addAluno - Resultado DB:', result);
      const newAluno = { id: result.lastInsertRowId, nome, status, contato, fotoUri, lembrete_hidratacao_minutos: lembreteHidratacaoMinutos, peso, altura, imc };
      console.log('addAluno - Novo aluno criado:', newAluno);
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
  updateAluno: async (id, nome, status = '', contato = '', fotoUri = '', lembreteHidratacaoMinutos: number | null = null, peso: number | null = null, altura: number | null = null, imc: number | null = null) => {
    const db = await getDatabase();
    try {
      await db.runAsync('UPDATE alunos SET nome = ?, status = ?, contato = ?, foto_uri = ?, lembrete_hidratacao_minutos = ?, peso = ?, altura = ?, imc = ? WHERE id = ?;', nome, status, contato, fotoUri, lembreteHidratacaoMinutos, peso, altura, imc, id);
      console.log('updateAluno - Aluno atualizado no DB.');
      set((state) => {
        const updatedAlunos = state.alunos.map((aluno) => (aluno.id === id ? { ...aluno, nome, status, contato, fotoUri, lembrete_hidratacao_minutos: lembreteHidratacaoMinutos, peso, altura, imc } : aluno));
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
  debugAlunos: async () => {
    const db = await getDatabase();
    try {
      console.log('=== DEBUG ALUNOS ===');
      const alunosDB = await db.getAllAsync<any>('SELECT * FROM alunos;');
      console.log('Alunos no banco:', alunosDB);
      
      alunosDB.forEach((aluno: any, index: number) => {
        console.log(`Aluno ${index + 1}:`, {
          id: aluno.id,
          nome: aluno.nome,
          foto_uri: aluno.foto_uri,
          fotoUri: aluno.fotoUri,
          temFotoUri: !!aluno.fotoUri,
          temFoto_uri: !!aluno.foto_uri
        });
      });
      
      console.log('Alunos no estado:', get().alunos);
      console.log('=== FIM DEBUG ===');
    } catch (error) {
      console.error('Erro no debug:', error);
    }
  },
  registrarMedida: async (medida) => {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO medidas (aluno_id, data, peso, altura, cintura, quadril) VALUES (?, ?, ?, ?, ?, ?);',
      medida.aluno_id,
      medida.data,
      medida.peso,
      medida.altura,
      medida.cintura ?? null,
      medida.quadril ?? null
    );
  },
  buscarMedidas: async (aluno_id) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>('SELECT * FROM medidas WHERE aluno_id = ? ORDER BY data DESC;', aluno_id);
    return rows.map((row: any) => ({
      id: row.id,
      aluno_id: row.aluno_id,
      data: row.data,
      peso: row.peso,
      altura: row.altura,
      cintura: row.cintura,
      quadril: row.quadril,
    }));
  },
}));

// Inicializa o banco de dados na primeira vez que o store é usado.
// Removendo a inicialização automática para evitar problemas
export default useAlunosStore;
