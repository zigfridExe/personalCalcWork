import { create } from 'zustand';
import { getDatabase } from '../../../../utils/databaseUtils';

interface HistoricoTreino {
  id: number;
  ficha_id: number;
  aluno_id: number;
  data_inicio: string;
  data_fim: string;
  duracao_minutos: number;
  observacoes?: string;
}

interface HistoricoSerie {
  id: number;
  historico_treino_id: number;
  exercicio_id: number;
  exercicio_nome: string; // novo campo
  serie_numero: number;
  repeticoes: string;
  carga: string;
  observacoes?: string;
  tempo_cadencia?: number;
}

interface HistoricoCompleto {
  treino: HistoricoTreino;
  series: HistoricoSerie[];
}

interface HistoricoState {
  historicos: HistoricoCompleto[];
  loadHistoricoByAluno: (alunoId: number) => Promise<void>;
  loadHistoricoByFicha: (fichaId: number) => Promise<void>;
  salvarTreino: (
    fichaId: number,
    alunoId: number,
    dataInicio: string,
    dataFim: string,
    series: Array<{
      exercicio_id: number;
      serie_numero: number;
      repeticoes: string;
      carga: string;
      observacoes?: string;
      tempoCadencia?: number;
    }>,
    observacoes?: string
  ) => Promise<void>;
  calcularDuracao: (dataInicio: string, dataFim: string) => number;
}

const useHistoricoStore = create<HistoricoState>((set, get) => ({
  historicos: [],

  loadHistoricoByAluno: async (alunoId: number) => {
    try {
      const db = await getDatabase();
      const historicos = await db.getAllAsync<HistoricoTreino>(
        'SELECT * FROM historico_treinos WHERE aluno_id = ? ORDER BY data_inicio DESC',
        [alunoId]
      );

      const historicosCompletos = await Promise.all(
        historicos.map(async (historico) => {
          const series = await db.getAllAsync<HistoricoSerie>(
            'SELECT * FROM historico_series WHERE historico_treino_id = ?',
            [historico.id]
          );
          return { treino: historico, series };
        })
      );

      set({ historicos: historicosCompletos });
    } catch (error) {
      console.error('Erro ao carregar histórico do aluno:', error);
      throw error;
    }
  },

  loadHistoricoByFicha: async (fichaId: number) => {
    try {
      const db = await getDatabase();
      const historicos = await db.getAllAsync<HistoricoTreino>(
        'SELECT * FROM historico_treinos WHERE ficha_id = ? ORDER BY data_inicio DESC',
        [fichaId]
      );

      const historicosCompletos = await Promise.all(
        historicos.map(async (historico) => {
          const series = await db.getAllAsync<HistoricoSerie>(
            'SELECT * FROM historico_series WHERE historico_treino_id = ?',
            [historico.id]
          );
          return { treino: historico, series };
        })
      );

      set({ historicos: historicosCompletos });
    } catch (error) {
      console.error('Erro ao carregar histórico da ficha:', error);
      throw error;
    }
  },

  salvarTreino: async (
    fichaId: number,
    alunoId: number,
    dataInicio: string,
    dataFim: string,
    series: Array<{
      exercicio_id: number;
      serie_numero: number;
      repeticoes: string;
      carga: string;
      observacoes?: string;
      tempoCadencia?: number;
    }>,
    observacoes?: string
  ) => {
    try {
      const db = await getDatabase();
      
      // Iniciar transação manualmente
      await db.execAsync('BEGIN TRANSACTION');
      
      try {
        // Inserir o histórico do treino
        const result = await db.runAsync(
          `INSERT INTO historico_treinos 
           (ficha_id, aluno_id, data_inicio, data_fim, duracao_minutos, observacoes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            fichaId,
            alunoId,
            dataInicio,
            dataFim,
            get().calcularDuracao(dataInicio, dataFim),
            observacoes || null
          ]
        );

        const historicoId = result.lastInsertRowId as number;

        // Inserir as séries do histórico
        for (const serie of series) {
          await db.runAsync(
            `INSERT INTO historico_series 
             (historico_treino_id, exercicio_id, exercicio_nome, serie_numero, repeticoes, carga, observacoes, tempo_cadencia)
             VALUES (?, ?, (SELECT nome FROM exercicios WHERE id = ?), ?, ?, ?, ?, ?)`,
            [
              historicoId,
              serie.exercicio_id,
              serie.exercicio_id, // Para pegar o nome do exercício
              serie.serie_numero,
              serie.repeticoes,
              serie.carga,
              serie.observacoes || null,
              serie.tempoCadencia || null
            ]
          );
        }
        
        // Confirmar a transação
        await db.execAsync('COMMIT');
        
        // Recarregar o histórico após salvar
        await get().loadHistoricoByFicha(fichaId);
      } catch (error) {
        // Em caso de erro, desfaz a transação
        await db.execAsync('ROLLBACK');
        throw error; // Relança o erro para ser tratado externamente
      }
    } catch (error) {
      console.error('Erro ao salvar histórico de treino:', error);
      throw error;
    }
  },

  calcularDuracao: (dataInicio: string, dataFim: string): number => {
    const inicio = new Date(dataInicio).getTime();
    const fim = new Date(dataFim).getTime();
    return Math.round((fim - inicio) / (1000 * 60)); // Retorna em minutos
  },
}));

export default useHistoricoStore;
