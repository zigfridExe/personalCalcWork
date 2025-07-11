import { create } from 'zustand';
import { getDatabase } from '../utils/databaseUtils';

export interface Aula {
  id?: number;
  aluno_id?: number;
  data: string;
  hora: string;
  descricao: string;
  presenca: boolean;
}

interface AulasState {
  aulas: Aula[];
  carregarAulas: () => Promise<void>;
  adicionarAula: (aula: Omit<Aula, 'id'>) => Promise<void>;
  editarAula: (aula: Aula) => Promise<void>;
  excluirAula: (id: number) => Promise<void>;
  marcarPresenca: (id: number, presenca: boolean) => Promise<void>;
}

const useAulasStore = create<AulasState>((set, get) => ({
  aulas: [],
  carregarAulas: async () => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>('SELECT * FROM aulas ORDER BY data, hora;');
    set({ aulas: rows.map((row: any) => ({
      id: row.id,
      aluno_id: row.aluno_id,
      data: row.data,
      hora: row.hora,
      descricao: row.descricao,
      presenca: !!row.presenca,
    })) });
  },
  adicionarAula: async (aula) => {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO aulas (aluno_id, data, hora, descricao, presenca) VALUES (?, ?, ?, ?, ?);',
      aula.aluno_id ?? null,
      aula.data,
      aula.hora,
      aula.descricao,
      aula.presenca ? 1 : 0
    );
    await get().carregarAulas();
  },
  editarAula: async (aula) => {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE aulas SET aluno_id = ?, data = ?, hora = ?, descricao = ?, presenca = ? WHERE id = ?;',
      aula.aluno_id ?? null,
      aula.data,
      aula.hora,
      aula.descricao,
      aula.presenca ? 1 : 0,
      aula.id
    );
    await get().carregarAulas();
  },
  excluirAula: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM aulas WHERE id = ?;', id);
    await get().carregarAulas();
  },
  marcarPresenca: async (id, presenca) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE aulas SET presenca = ? WHERE id = ?;', presenca ? 1 : 0, id);
    await get().carregarAulas();
  },
}));

export default useAulasStore; 