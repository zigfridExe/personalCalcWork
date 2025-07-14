import { create } from 'zustand';
import { getDatabase } from '../utils/databaseUtils';

export type TipoAula = 'RECORRENTE' | 'AVULSA' | 'SOBREESCRITA' | 'CANCELADA_RECORRENTE';

export interface Aula {
  id?: number;
  aluno_id: number;
  aluno_nome?: string;
  data_aula: string; // 'YYYY-MM-DD'
  hora_inicio: string; // 'HH:MM'
  duracao_minutos: number;
  presenca: number; // 0=Agendada, 1=Presente, 2=Faltou, 3=Cancelada
  observacoes?: string;
  tipo_aula: TipoAula;
  horario_recorrente_id?: number | null;
}

interface AulasState {
  aulas: Aula[];
  carregarAulas: (periodoInicio?: string, periodoFim?: string, aluno_id?: number) => Promise<void>;
  adicionarAula: (aula: Omit<Aula, 'id'>) => Promise<void>;
  editarAula: (aula: Aula) => Promise<void>;
  excluirAula: (id: number) => Promise<void>;
  marcarPresenca: (id: number, presenca: number) => Promise<void>;
}

const useAulasStore = create<AulasState>((set, get) => ({
  aulas: [],
  carregarAulas: async (periodoInicio, periodoFim, aluno_id) => {
    console.log(`[AULAS] 🔍 Carregando aulas: ${periodoInicio} até ${periodoFim}${aluno_id ? ` (Aluno ${aluno_id})` : ''}`);
    console.log(`[AULAS] 📅 Período inicial: ${periodoInicio}`);
    console.log(`[AULAS] 📅 Período final: ${periodoFim}`);
    console.log(`[AULAS] 👤 Aluno ID: ${aluno_id || 'Todos'}`);
    
    const db = await getDatabase();
    let query = `SELECT aulas.*, alunos.nome as aluno_nome FROM aulas LEFT JOIN alunos ON aulas.aluno_id = alunos.id WHERE 1=1`;
    const params: any[] = [];
    if (periodoInicio) {
      query += ' AND data_aula >= ?';
      params.push(periodoInicio);
    }
    if (periodoFim) {
      query += ' AND data_aula <= ?';
      params.push(periodoFim);
    }
    if (aluno_id) {
      query += ' AND aulas.aluno_id = ?';
      params.push(aluno_id);
    }
    query += ' ORDER BY data_aula, hora_inicio';
    
    console.log(`[AULAS] 📋 Query: ${query}`);
    console.log(`[AULAS] 📋 Params:`, params);
    
    const rows = await db.getAllAsync<any>(query, params);
    console.log(`[AULAS] 📊 Encontradas ${rows.length} aulas no banco`);
    
    // Log das primeiras 5 aulas para debug
    rows.slice(0, 5).forEach((row, index) => {
      console.log(`[AULAS] 📅 Aula ${index + 1}: ${row.data_aula} ${row.hora_inicio} - ${row.aluno_nome} (${row.tipo_aula})`);
    });
    
    set({ aulas: [] }); // Limpa o estado antes de setar as novas aulas
    set({ aulas: rows.map((row: any) => ({
      id: row.id,
      aluno_id: row.aluno_id,
      aluno_nome: row.aluno_nome,
      data_aula: row.data_aula,
      hora_inicio: row.hora_inicio,
      duracao_minutos: row.duracao_minutos,
      presenca: row.presenca,
      observacoes: row.observacoes,
      tipo_aula: row.tipo_aula,
      horario_recorrente_id: row.horario_recorrente_id,
    })) });
    
    console.log(`[AULAS] ✅ Estado atualizado com ${rows.length} aulas`);
  },
  adicionarAula: async (aula) => {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, observacoes, tipo_aula, horario_recorrente_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      aula.aluno_id,
      aula.data_aula,
      aula.hora_inicio,
      aula.duracao_minutos,
      aula.presenca,
      aula.observacoes ?? null,
      aula.tipo_aula,
      aula.horario_recorrente_id !== undefined ? aula.horario_recorrente_id : null
    );
    await get().carregarAulas();
  },
  editarAula: async (aula) => {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE aulas SET aluno_id = ?, data_aula = ?, hora_inicio = ?, duracao_minutos = ?, presenca = ?, observacoes = ?, tipo_aula = ?, horario_recorrente_id = ? WHERE id = ?;`,
      aula.aluno_id,
      aula.data_aula,
      aula.hora_inicio,
      aula.duracao_minutos,
      aula.presenca,
      aula.observacoes ?? null,
      aula.tipo_aula,
      aula.horario_recorrente_id !== undefined ? aula.horario_recorrente_id : null,
      aula.id !== undefined ? aula.id : 0
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
    await db.runAsync('UPDATE aulas SET presenca = ? WHERE id = ?;', presenca, id);
    await get().carregarAulas();
  },
}));

export default useAulasStore; 