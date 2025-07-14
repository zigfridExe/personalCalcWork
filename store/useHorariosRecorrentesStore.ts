import { create } from 'zustand';
import {
  buscarHorariosRecorrentes,
  inserirHorarioRecorrente,
  atualizarHorarioRecorrente,
  desativarHorarioRecorrente
} from '../utils/databaseUtils';

export type HorarioRecorrente = {
  id: number;
  aluno_id: number;
  dia_semana: number;
  hora_inicio: string;
  duracao_minutos: number;
  ativo: number;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
};

type State = {
  horarios: HorarioRecorrente[];
  loading: boolean;
  error: string | null;
  fetchHorarios: (aluno_id?: number) => Promise<void>;
  addHorario: (horario: Omit<HorarioRecorrente, 'id' | 'ativo'> & { ativo?: number }) => Promise<void>;
  updateHorario: (id: number, dados: Partial<Omit<HorarioRecorrente, 'id' | 'aluno_id'>>) => Promise<void>;
  deactivateHorario: (id: number) => Promise<void>;
};

export const useHorariosRecorrentesStore = create<State>((set) => ({
  horarios: [],
  loading: false,
  error: null,

  fetchHorarios: async (aluno_id) => {
    set({ loading: true, error: null });
    try {
      const horarios = await buscarHorariosRecorrentes(aluno_id) as HorarioRecorrente[];
      set({ horarios, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao buscar horários', loading: false });
    }
  },

  addHorario: async (horario) => {
    set({ loading: true, error: null });
    try {
      await inserirHorarioRecorrente(horario);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao adicionar horário', loading: false });
    }
  },

  updateHorario: async (id, dados) => {
    set({ loading: true, error: null });
    try {
      await atualizarHorarioRecorrente(id, dados);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao atualizar horário', loading: false });
    }
  },

  deactivateHorario: async (id) => {
    set({ loading: true, error: null });
    try {
      await desativarHorarioRecorrente(id);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Erro ao desativar horário', loading: false });
    }
  },
})); 