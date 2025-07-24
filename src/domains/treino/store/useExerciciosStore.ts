import { create } from 'zustand';
import { getDatabase } from '../../../../utils/databaseUtils';

export interface Exercicio {
  id: number;
  ficha_id: number;
  nome: string;
  grupo_muscular?: string;
  ordem?: number;
}

export interface ExercicioSerie {
  id: number;
  exercicio_id: number;
  series: string;
  repeticoes: string;
  carga?: string;
  observacoes?: string;
  ordem?: number;
}

interface ExerciciosState {
  exercicios: Exercicio[];
  exercicioSeries: Record<number, ExercicioSerie[]>;
  loadExerciciosByFichaId: (fichaId: number) => Promise<void>;
  loadSeriesByExercicioId: (exercicioId: number) => Promise<void>;
  addExercicio: (exercicio: Omit<Exercicio, 'id'>) => Promise<void>;
  updateExercicio: (exercicio: Exercicio) => Promise<void>;
  deleteExercicio: (exercicioId: number) => Promise<void>;
  addSerie: (serie: Omit<ExercicioSerie, 'id'>) => Promise<void>;
  updateSerie: (serie: ExercicioSerie) => Promise<void>;
  deleteSerie: (serieId: number) => Promise<void>;
}

const useExerciciosStore = create<ExerciciosState>((set, get) => ({
  exercicios: [],
  exercicioSeries: {},
  
  loadExerciciosByFichaId: async (fichaId) => {
    const db = await getDatabase();
    try {
      const exercicios = await db.getAllAsync<Exercicio>(
        'SELECT * FROM exercicios WHERE ficha_id = ? ORDER BY ordem ASC, id ASC;',
        [fichaId]
      );
      set({ exercicios });
      
      // Carregar as séries para cada exercício
      for (const exercicio of exercicios) {
        await get().loadSeriesByExercicioId(exercicio.id);
      }
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      throw error;
    }
  },
  
  loadSeriesByExercicioId: async (exercicioId) => {
    const db = await getDatabase();
    try {
      const series = await db.getAllAsync<ExercicioSerie>(
        'SELECT * FROM exercicio_series WHERE exercicio_id = ? ORDER BY ordem ASC, id ASC;',
        [exercicioId]
      );
      
      set((state) => ({
        exercicioSeries: {
          ...state.exercicioSeries,
          [exercicioId]: series,
        },
      }));
    } catch (error) {
      console.error('Erro ao carregar séries do exercício:', error);
      throw error;
    }
  },
  
  addExercicio: async (exercicio) => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'INSERT INTO exercicios (ficha_id, nome, grupo_muscular, ordem) VALUES (?, ?, ?, ?);',
        [
          exercicio.ficha_id,
          exercicio.nome,
          exercicio.grupo_muscular || null,
          exercicio.ordem || 0,
        ]
      );
      
      const newExercicio = {
        ...exercicio,
        id: result.lastInsertRowId as number,
      };
      
      set((state) => ({
        exercicios: [...state.exercicios, newExercicio],
      }));
      
      // Não retornamos nada, apenas atualizamos o estado
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
      throw error;
    }
  },
  
  updateExercicio: async (exercicio) => {
    const db = await getDatabase();
    try {
      await db.runAsync(
        'UPDATE exercicios SET nome = ?, grupo_muscular = ?, ordem = ? WHERE id = ?;',
        [
          exercicio.nome,
          exercicio.grupo_muscular || null,
          exercicio.ordem || 0,
          exercicio.id,
        ]
      );
      
      set((state) => ({
        exercicios: state.exercicios.map((e) =>
          e.id === exercicio.id ? exercicio : e
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      throw error;
    }
  },
  
  deleteExercicio: async (exercicioId) => {
    const db = await getDatabase();
    try {
      // Primeiro, remover as séries do exercício
      await db.runAsync('DELETE FROM exercicio_series WHERE exercicio_id = ?;', [
        exercicioId,
      ]);
      
      // Depois, remover o exercício
      await db.runAsync('DELETE FROM exercicios WHERE id = ?;', [exercicioId]);
      
      set((state) => ({
        exercicios: state.exercicios.filter((e) => e.id !== exercicioId),
        exercicioSeries: Object.fromEntries(
          Object.entries(state.exercicioSeries).filter(([key]) => {
            const id = parseInt(key, 10);
            return !isNaN(id) && id !== exercicioId;
          })
        ),
      }));
    } catch (error) {
      console.error('Erro ao remover exercício:', error);
      throw error;
    }
  },
  
  addSerie: async (serie) => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'INSERT INTO exercicio_series (exercicio_id, series, repeticoes, carga, observacoes, ordem) VALUES (?, ?, ?, ?, ?, ?);',
        [
          serie.exercicio_id,
          serie.series,
          serie.repeticoes,
          serie.carga || null,
          serie.observacoes || null,
          serie.ordem || 0,
        ]
      );
      
      const newSerie = {
        ...serie,
        id: result.lastInsertRowId as number,
      };
      
      // Atualizar o estado com a nova série
      set((state) => ({
        exercicioSeries: {
          ...state.exercicioSeries,
          [serie.exercicio_id]: [
            ...(state.exercicioSeries[serie.exercicio_id] || []),
            newSerie,
          ],
        },
      }));
      
      // Não retornamos nada, apenas atualizamos o estado
    } catch (error) {
      console.error('Erro ao adicionar série:', error);
      throw error;
    }
  },
  
  updateSerie: async (serie) => {
    const db = await getDatabase();
    try {
      await db.runAsync(
        'UPDATE exercicio_series SET series = ?, repeticoes = ?, carga = ?, observacoes = ?, ordem = ? WHERE id = ?;',
        [
          serie.series,
          serie.repeticoes,
          serie.carga || null,
          serie.observacoes || null,
          serie.ordem || 0,
          serie.id,
        ]
      );
      
      set((state) => {
        const series = state.exercicioSeries[serie.exercicio_id] || [];
        const updatedSeries = series.map((s) =>
          s.id === serie.id ? serie : s
        );
        
        return {
          exercicioSeries: {
            ...state.exercicioSeries,
            [serie.exercicio_id]: updatedSeries,
          },
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar série:', error);
      throw error;
    }
  },
  
  deleteSerie: async (serieId) => {
    const db = await getDatabase();
    try {
      // Primeiro, obter o exercício_id para atualizar o estado
      const serieToDelete = await db.getFirstAsync<{ exercicio_id: number }>(
        'SELECT exercicio_id FROM exercicio_series WHERE id = ?;',
        [serieId]
      );
      
      if (!serieToDelete) {
        throw new Error('Série não encontrada');
      }
      
      // Depois, remover a série do banco de dados
      await db.runAsync('DELETE FROM exercicio_series WHERE id = ?;', [serieId]);
      
      // Atualizar o estado
      set((state) => {
        const series = state.exercicioSeries[serieToDelete.exercicio_id] || [];
        const updatedSeries = series.filter((s) => s.id !== serieId);
        
        return {
          exercicioSeries: {
            ...state.exercicioSeries,
            [serieToDelete.exercicio_id]: updatedSeries,
          },
        };
      });
    } catch (error) {
      console.error('Erro ao remover série:', error);
      throw error;
    }
  },
}));

export default useExerciciosStore;
