import { create } from 'zustand';
import { getDatabase } from '../../../../utils/databaseUtils';

export interface Ficha {
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
  copyFicha: (fichaId: number, novoAlunoId?: number, novoNome?: string) => Promise<number>;
}

const useFichasStore = create<FichasState>((set, get) => ({
  fichas: [],
  
  loadFichasByAlunoId: async (alunoId) => {
    const db = await getDatabase();
    try {
      const fichas = await db.getAllAsync<Ficha>('SELECT * FROM fichas WHERE aluno_id = ?;', [alunoId]);
      set({ fichas });
    } catch (error) {
      console.error('Erro ao carregar fichas:', error);
      throw error;
    }
  },
  
  addFicha: async (ficha) => {
    const db = await getDatabase();
    try {
      const result = await db.runAsync(
        'INSERT INTO fichas (aluno_id, nome, data_inicio, data_fim, objetivos, observacoes, professor, descanso_padrao) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [
          ficha.aluno_id,
          ficha.nome,
          ficha.data_inicio || null,
          ficha.data_fim || null,
          ficha.objetivos || null,
          ficha.observacoes || null,
          ficha.professor || null,
          ficha.descanso_padrao || null
        ]
      );
      const newFicha = { ...ficha, id: result.lastInsertRowId as number };
      set((state) => ({ fichas: [...state.fichas, newFicha] }));
      // Não retornamos nada, apenas atualizamos o estado
    } catch (error) {
      console.error('Erro ao adicionar ficha:', error);
      throw error;
    }
  },
  
  updateFicha: async (ficha) => {
    const db = await getDatabase();
    try {
      await db.runAsync(
        'UPDATE fichas SET nome = ?, data_inicio = ?, data_fim = ?, objetivos = ?, observacoes = ?, professor = ?, descanso_padrao = ? WHERE id = ?;',
        [
          ficha.nome,
          ficha.data_inicio || null,
          ficha.data_fim || null,
          ficha.objetivos || null,
          ficha.observacoes || null,
          ficha.professor || null,
          ficha.descanso_padrao || null,
          ficha.id
        ]
      );
      set((state) => ({
        fichas: state.fichas.map((f) => (f.id === ficha.id ? ficha : f)),
      }));
    } catch (error) {
      console.error('Erro ao atualizar ficha:', error);
      throw error;
    }
  },
  
  deleteFicha: async (fichaId) => {
    const db = await getDatabase();
    try {
      await db.runAsync('DELETE FROM fichas WHERE id = ?;', [fichaId]);
      set((state) => ({
        fichas: state.fichas.filter((f) => f.id !== fichaId),
      }));
    } catch (error) {
      console.error('Erro ao remover ficha:', error);
      throw error;
    }
  },
  
  copyFicha: async (fichaId, novoAlunoId, novoNome) => {
    const db = await getDatabase();
    try {
      // Buscar a ficha original
      const fichaOriginal = (await db.getAllAsync<Ficha>('SELECT * FROM fichas WHERE id = ?;', [fichaId]))[0];
      
      if (!fichaOriginal) {
        throw new Error('Ficha não encontrada');
      }
      
      // Iniciar transação
      await db.execAsync('BEGIN TRANSACTION');
      
      try {
        // Inserir a nova ficha
        const result = await db.runAsync(
          'INSERT INTO fichas (aluno_id, nome, data_inicio, data_fim, objetivos, observacoes, professor, descanso_padrao) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
          [
            novoAlunoId !== undefined ? novoAlunoId : fichaOriginal.aluno_id,
            novoNome || `Cópia de ${fichaOriginal.nome}`,
            fichaOriginal.data_inicio || null,
            fichaOriginal.data_fim || null,
            fichaOriginal.objetivos || null,
            fichaOriginal.observacoes || null,
            fichaOriginal.professor || null,
            fichaOriginal.descanso_padrao || null
          ]
        );
        
        const novaFichaId = result.lastInsertRowId as number;
        
        // Copiar os exercícios da ficha
        const exercicios = await db.getAllAsync<{id: number, ficha_id: number, nome: string, grupo_muscular?: string, ordem?: number}>(
          'SELECT * FROM exercicios WHERE ficha_id = ?;',
          [fichaId]
        );
        
        for (const exercicio of exercicios) {
          const resultExercicio = await db.runAsync(
            'INSERT INTO exercicios (ficha_id, nome, grupo_muscular, ordem) VALUES (?, ?, ?, ?);',
            [novaFichaId, exercicio.nome, exercicio.grupo_muscular || null, exercicio.ordem || 0]
          );
          
          const novoExercicioId = resultExercicio.lastInsertRowId as number;
          
          // Copiar as séries do exercício
          const series = await db.getAllAsync<{id: number, exercicio_id: number, series: string, repeticoes: string, carga?: string, observacoes?: string, ordem?: number}>(
            'SELECT * FROM exercicio_series WHERE exercicio_id = ?;',
            [exercicio.id]
          );
          
          for (const serie of series) {
            await db.runAsync(
              'INSERT INTO exercicio_series (exercicio_id, series, repeticoes, carga, observacoes, ordem) VALUES (?, ?, ?, ?, ?, ?);',
              [novoExercicioId, serie.series, serie.repeticoes, serie.carga || null, serie.observacoes || null, serie.ordem || 0]
            );
          }
        }
        
        // Confirmar a transação
        await db.execAsync('COMMIT');
        
        // Recarregar as fichas
        if (novoAlunoId !== undefined) {
          await get().loadFichasByAlunoId(novoAlunoId);
        } else {
          await get().loadFichasByAlunoId(fichaOriginal.aluno_id);
        }
        
        return novaFichaId;
      } catch (error) {
        // Em caso de erro, desfaz a transação
        await db.execAsync('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao copiar ficha:', error);
      throw error;
    }
  },
}));

export default useFichasStore;
