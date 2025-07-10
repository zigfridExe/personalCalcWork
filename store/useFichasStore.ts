import { create } from 'zustand';
import { getDatabase } from '../utils/databaseUtils';

interface Ficha {
  id: number;
  aluno_id: number;
  nome: string;
  data_inicio?: string;
  data_fim?: string;
  objetivos?: string;
  observacoes?: string;
  professor?: string;
  descanso_padrao?: string;
}

interface FichasState {
  fichas: Ficha[];
  loadFichasByAlunoId: (alunoId: number) => Promise<void>;
  addFicha: (ficha: Omit<Ficha, 'id'>) => Promise<void>;
  updateFicha: (ficha: Ficha) => Promise<void>;
  deleteFicha: (fichaId: number) => Promise<void>;
}

const useFichasStore = create<FichasState>((set, get) => ({
  fichas: [],
  loadFichasByAlunoId: async (alunoId) => {
    const db = await getDatabase();
    try {
      const fichas = await db.getAllAsync<Ficha>('SELECT * FROM fichas WHERE aluno_id = ?;', alunoId);
      set({ fichas });
    } catch (error) {
      console.error('Erro ao carregar fichas:', error);
    }
  },
  addFicha: async (ficha) => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'INSERT INTO fichas (aluno_id, nome, data_inicio, data_fim, objetivos, observacoes, professor, descanso_padrao) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        ficha.aluno_id,
        ficha.nome,
        ficha.data_inicio || null,
        ficha.data_fim || null,
        ficha.objetivos || null,
        ficha.observacoes || null,
        ficha.professor || null,
        ficha.descanso_padrao || null
      );
      const newFicha = { ...ficha, id: result.lastInsertRowId };
      set((state) => ({ fichas: [...state.fichas, newFicha] }));
    } catch (error) {
      console.error('Erro ao adicionar ficha:', error);
    }
  },
  updateFicha: async (ficha) => {
    const db = await getDatabase();
    try {
      await db.runAsync(
        'UPDATE fichas SET nome = ?, data_inicio = ?, data_fim = ?, objetivos = ?, observacoes = ?, professor = ?, descanso_padrao = ? WHERE id = ?;',
        ficha.nome,
        ficha.data_inicio || null,
        ficha.data_fim || null,
        ficha.objetivos || null,
        ficha.observacoes || null,
        ficha.professor || null,
        ficha.descanso_padrao || null,
        ficha.id
      );
      set((state) => ({
        fichas: state.fichas.map((f) => (f.id === ficha.id ? { ...f, ...ficha } : f)),
      }));
    } catch (error) {
      console.error('Erro ao atualizar ficha:', error);
    }
  },
  deleteFicha: async (fichaId) => {
    const db = await getDatabase();
    try {
      await db.runAsync('DELETE FROM fichas WHERE id = ?;', fichaId);
      set((state) => ({ fichas: state.fichas.filter((f) => f.id !== fichaId) }));
    } catch (error) {
      console.error('Erro ao deletar ficha:', error);
    }
  },
}));

export default useFichasStore;
