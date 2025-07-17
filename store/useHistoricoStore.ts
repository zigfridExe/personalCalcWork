import { create } from 'zustand';
import { getDatabase } from '../utils/databaseUtils';

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
    const db = await getDatabase();
    try {
      const treinos = await db.getAllAsync<HistoricoTreino>(
        'SELECT * FROM historico_treinos WHERE aluno_id = ? ORDER BY data_inicio DESC;',
        alunoId
      );

      const historicosCompletos: HistoricoCompleto[] = [];
      
      for (const treino of treinos) {
        const series = await db.getAllAsync<HistoricoSerie>(
          `SELECT hs.*, e.nome as exercicio_nome
           FROM historico_series hs
           JOIN exercicios e ON hs.exercicio_id = e.id
           WHERE hs.historico_treino_id = ?
           ORDER BY hs.serie_numero;`,
          treino.id
        );
        
        historicosCompletos.push({
          treino,
          series
        });
      }

      set({ historicos: historicosCompletos });
    } catch (error) {
      console.error('Erro ao carregar histórico do aluno:', error);
    }
  },

  loadHistoricoByFicha: async (fichaId: number) => {
    const db = await getDatabase();
    try {
      const treinos = await db.getAllAsync<HistoricoTreino>(
        'SELECT * FROM historico_treinos WHERE ficha_id = ? ORDER BY data_inicio DESC;',
        fichaId
      );

      const historicosCompletos: HistoricoCompleto[] = [];
      
      for (const treino of treinos) {
        const series = await db.getAllAsync<HistoricoSerie>(
          `SELECT hs.*, e.nome as exercicio_nome
           FROM historico_series hs
           JOIN exercicios e ON hs.exercicio_id = e.id
           WHERE hs.historico_treino_id = ?
           ORDER BY hs.serie_numero;`,
          treino.id
        );
        
        historicosCompletos.push({
          treino,
          series
        });
      }

      set({ historicos: historicosCompletos });
    } catch (error) {
      console.error('Erro ao carregar histórico da ficha:', error);
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
    const db = await getDatabase();
    try {
      const duracao = get().calcularDuracao(dataInicio, dataFim);
      
      // Inserir o treino
      const result = await db.runAsync(
        'INSERT INTO historico_treinos (ficha_id, aluno_id, data_inicio, data_fim, duracao_minutos, observacoes) VALUES (?, ?, ?, ?, ?, ?);',
        fichaId,
        alunoId,
        dataInicio,
        dataFim,
        duracao,
        observacoes || null
      );

      const historicoTreinoId = result.lastInsertRowId;

      // Inserir as séries
      for (const serie of series) {
        await db.runAsync(
          'INSERT INTO historico_series (historico_treino_id, exercicio_id, serie_numero, repeticoes, carga, observacoes, tempo_cadencia) VALUES (?, ?, ?, ?, ?, ?, ?);',
          historicoTreinoId,
          serie.exercicio_id,
          serie.serie_numero,
          serie.repeticoes,
          serie.carga,
          serie.observacoes || null,
          serie.tempoCadencia || null
        );
      }

      console.log('Treino salvo no histórico com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar treino no histórico:', error);
      throw error;
    }
  },

  calcularDuracao: (dataInicio: string, dataFim: string): number => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffMs = fim.getTime() - inicio.getTime();
    return Math.round(diffMs / (1000 * 60)); // Retorna em minutos
  },
}));

export default useHistoricoStore; 