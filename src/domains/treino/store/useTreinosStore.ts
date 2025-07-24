import { create } from 'zustand';
import { getDatabase } from '../../../../utils/databaseUtils';

interface Treino {
  id: number;
  ficha_id: number;
  nome: string;
}

interface TreinosState {
  treinos: Treino[];
  loadTreinosByFichaId: (fichaId: number) => Promise<void>;
  addTreino: (treino: Omit<Treino, 'id'>) => Promise<void>;
  updateTreino: (treino: Treino) => Promise<void>;
  deleteTreino: (treinoId: number) => Promise<void>;
}

const useTreinosStore = create<TreinosState>((set, get) => ({
  treinos: [],
  
  loadTreinosByFichaId: async (fichaId) => {
    const db = await getDatabase();
    try {
      const treinos = await db.getAllAsync<Treino>('SELECT * FROM treinos WHERE ficha_id = ?;', [fichaId]);
      set({ treinos });
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      throw error;
    }
  },
  
  addTreino: async (treino) => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'INSERT INTO treinos (ficha_id, nome) VALUES (?, ?);',
        [treino.ficha_id, treino.nome]
      );
      const newTreino = { ...treino, id: result.lastInsertRowId as number };
      set((state) => ({ treinos: [...state.treinos, newTreino] }));
      // Não retornamos nada, apenas atualizamos o estado
    } catch (error) {
      console.error('Erro ao adicionar treino:', error);
      throw error;
    }
  },
  
  updateTreino: async (treino) => {
    const db = await getDatabase();
    try {
      await db.runAsync(
        'UPDATE treinos SET nome = ? WHERE id = ?;',
        [treino.nome, treino.id]
      );
      set((state) => ({
        treinos: state.treinos.map((t) => (t.id === treino.id ? treino : t)),
      }));
    } catch (error) {
      console.error('Erro ao atualizar treino:', error);
      throw error;
    }
  },
  
  deleteTreino: async (treinoId) => {
    const db = await getDatabase();
    try {
      await db.runAsync('DELETE FROM treinos WHERE id = ?;', [treinoId]);
      set((state) => ({
        treinos: state.treinos.filter((t) => t.id !== treinoId),
      }));
    } catch (error) {
      console.error('Erro ao remover treino:', error);
      throw error;
    }
  },
}));

export default useTreinosStore;
