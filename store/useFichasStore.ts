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
  copyFicha: (fichaId: number, novoAlunoId?: number, novoNome?: string) => Promise<number>;
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
  copyFicha: async (fichaId, novoAlunoId, novoNome) => {
    const db = await getDatabase();
    try {
      // Buscar a ficha original
      const fichaOriginal = get().fichas.find(f => f.id === fichaId);
      if (!fichaOriginal) {
        throw new Error('Ficha não encontrada');
      }

      // Determinar o novo nome e aluno
      const nomeFinal = novoNome || `${fichaOriginal.nome} (Cópia)`;
      const alunoIdFinal = novoAlunoId || fichaOriginal.aluno_id;

      // Criar nova ficha
      const result = await db.runAsync(
        'INSERT INTO fichas (aluno_id, nome, data_inicio, data_fim, objetivos, observacoes, professor, descanso_padrao) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        alunoIdFinal,
        nomeFinal,
        fichaOriginal.data_inicio || null,
        fichaOriginal.data_fim || null,
        fichaOriginal.objetivos || null,
        fichaOriginal.observacoes || null,
        fichaOriginal.professor || null,
        fichaOriginal.descanso_padrao || null
      );

      const novaFichaId = result.lastInsertRowId;

      // Buscar exercícios da ficha original
      const exercicios = await db.getAllAsync<any>('SELECT * FROM exercicios WHERE ficha_id = ?;', fichaId);

      // Copiar exercícios para a nova ficha
      for (const exercicio of exercicios) {
        await db.runAsync(
          'INSERT INTO exercicios (ficha_id, grupo_muscular, nome, maquina, series, repeticoes, carga, ajuste, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
          novaFichaId,
          exercicio.grupo_muscular || null,
          exercicio.nome,
          exercicio.maquina || null,
          exercicio.series || null,
          exercicio.repeticoes || null,
          exercicio.carga || null,
          exercicio.ajuste || null,
          exercicio.observacoes || null
        );
      }

      // Adicionar nova ficha ao estado (REMOVIDO para evitar duplicação com o refresh da tela)
      // set((state) => ({ fichas: [...state.fichas, novaFicha] }));

      console.log(`Ficha copiada com sucesso. Nova ficha ID: ${novaFichaId}`);
      return novaFichaId;
    } catch (error) {
      console.error('Erro ao copiar ficha:', error);
      throw error;
    }
  },
}));

export default useFichasStore;
