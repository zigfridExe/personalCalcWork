import { create } from 'zustand';
import { getDatabase } from '../utils/databaseUtils';

interface Exercicio {
  id: number;
  ficha_id: number;
  grupo_muscular?: string;
  nome: string;
  maquina?: string;
  series?: string;
  repeticoes?: string;
  carga?: string;
  ajuste?: string;
  observacoes?: string;
}

interface ExerciciosState {
  exercicios: Exercicio[];
  loadExerciciosByFichaId: (fichaId: number) => Promise<void>;
  addExercicio: (exercicio: Omit<Exercicio, 'id'>) => Promise<void>;
  updateExercicio: (exercicio: Exercicio) => Promise<void>;
  deleteExercicio: (exercicioId: number) => Promise<void>;
}

const useExerciciosStore = create<ExerciciosState>((set, get) => ({
  exercicios: [],
  loadExerciciosByFichaId: async (fichaId) => {
    const db = await getDatabase();
    try {
      const exercicios = await db.getAllAsync<Exercicio>('SELECT * FROM exercicios WHERE ficha_id = ?;', fichaId);
      set({ exercicios });
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    }
  },
  addExercicio: async (exercicio) => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'INSERT INTO exercicios (ficha_id, grupo_muscular, nome, maquina, series, repeticoes, carga, ajuste, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
        exercicio.ficha_id,
        exercicio.grupo_muscular || null,
        exercicio.nome,
        exercicio.maquina || null,
        exercicio.series || null,
        exercicio.repeticoes || null,
        exercicio.carga || null,
        exercicio.ajuste || null,
        exercicio.observacoes || null
      );
      const newExercicio = { ...exercicio, id: result.lastInsertRowId };
      set((state) => ({ exercicios: [...state.exercicios, newExercicio] }));
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
    }
  },
  updateExercicio: async (exercicio) => {
    const db = await getDatabase();
    try {
      await db.runAsync(
        'UPDATE exercicios SET ficha_id = ?, grupo_muscular = ?, nome = ?, maquina = ?, series = ?, repeticoes = ?, carga = ?, ajuste = ?, observacoes = ? WHERE id = ?;',
        exercicio.ficha_id,
        exercicio.grupo_muscular || null,
        exercicio.nome,
        exercicio.maquina || null,
        exercicio.series || null,
        exercicio.repeticoes || null,
        exercicio.carga || null,
        exercicio.ajuste || null,
        exercicio.observacoes || null,
        exercicio.id
      );
      set((state) => ({
        exercicios: state.exercicios.map((e) => (e.id === exercicio.id ? { ...e, ...exercicio } : e)),
      }));
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
    }
  },
  deleteExercicio: async (exercicioId) => {
    const db = await getDatabase();
    try {
      await db.runAsync('DELETE FROM exercicios WHERE id = ?;', exercicioId);
      set((state) => ({ exercicios: state.exercicios.filter((e) => e.id !== exercicioId) }));
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
    }
  },
}));

export default useExerciciosStore;
