import { create } from 'zustand';
import { getDatabase } from '../utils/databaseUtils';
import { gerarCalendarioVisual, AulaCalendario, RegraRecorrencia, EventoConcreto } from '../utils/novoCalendarioUtils';

interface AulasState {
  aulasVisuais: AulaCalendario[]; // Lista final para a UI
  carregarCalendario: (mes: number, ano: number) => Promise<void>;

  // Ações
  criarRegraRecorrente: (aluno_id: number, dia_semana: number, hora: string, duracao: number, inicio: string) => Promise<void>;
  criarAulaAvulsa: (aluno_id: number, data: string, hora: string, duracao: number, obs?: string) => Promise<void>;
  adicionarAula: (dados: { aluno_id: number; data_aula: string; hora_inicio: string; duracao_minutos: number; presenca: number; observacoes?: string; tipo_aula: string; horario_recorrente_id?: number | null }) => Promise<void>;
  cancelarAula: (aula: AulaCalendario) => Promise<void>; // Cria exceção
  confirmarAula: (aula: AulaCalendario) => Promise<void>; // Concretiza a virtual
  obterAulasDoAluno: (aluno_id: number, inicio: Date, fim: Date) => Promise<AulaCalendario[]>;
  listarRegrasAtivas: (aluno_id: number) => Promise<RegraRecorrencia[]>;
  encerrarRegraRecorrente: (regra_id: number) => Promise<void>;
}

const useAulasStore = create<AulasState>((set, get) => ({
  aulasVisuais: [],

  carregarCalendario: async (mes, ano) => {
    const db = await getDatabase();

    // 1. Definir intervalo do mês (com margem de segurança)
    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 0); // Último dia do mês
    const inicioStr = inicio.toISOString().slice(0, 10);
    const fimStr = fim.toISOString().slice(0, 10);

    // 2. Buscar Regras Ativas
    // (Busca regras que começam antes do fim do mês e não terminaram antes do inicio do mês)
    const regras = await db.getAllAsync<RegraRecorrencia>(`
      SELECT id, aluno_id, dia_semana, hora_inicio, duracao_minutos, data_inicio_vigencia, data_fim_vigencia 
      FROM horarios_recorrentes 
      WHERE data_inicio_vigencia <= ? 
      AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= ?)
    `, fimStr, inicioStr);

    // 3. Buscar Eventos Concretos (Avulsas, Realizadas, Canceladas) no período
    const eventos = await db.getAllAsync<any>(`
      SELECT id, aluno_id, data_aula, hora_inicio, tipo_aula, presenca as status_presenca, observacoes, horario_recorrente_id as recorrencia_id
      FROM aulas 
      WHERE data_aula BETWEEN ? AND ?
      AND tipo_aula != 'RECORRENTE_GERADA' -- Ignorar lixo legado se houver
    `, inicioStr, fimStr);

    // Mapear para tipagem correta
    const eventosConcretos: EventoConcreto[] = eventos.map((e: any) => ({
      ...e,
      tipo_aula: e.tipo_aula as any
    }));

    // 4. Gerar Visualização Pura
    const calendario = gerarCalendarioVisual(inicio, fim, regras, eventosConcretos);

    set({ aulasVisuais: calendario });
  },

  criarRegraRecorrente: async (aluno_id, dia_semana, hora, duracao, inicio) => {
    const db = await getDatabase();
    await db.runAsync(`
      INSERT INTO horarios_recorrentes (aluno_id, dia_semana, hora_inicio, duracao_minutos, data_inicio_vigencia)
      VALUES (?, ?, ?, ?, ?);
    `, aluno_id, dia_semana, hora, duracao, inicio);

    // Recarregar visualização atual
    const hoje = new Date(); // Simplificação: recarrega o mês atual
    await get().carregarCalendario(hoje.getMonth() + 1, hoje.getFullYear());
  },

  criarAulaAvulsa: async (aluno_id, data, hora, duracao, obs) => {
    const db = await getDatabase();
    await db.runAsync(`
      INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, observacoes, tipo_aula)
      VALUES (?, ?, ?, ?, 0, ?, 'AVULSA');
    `, aluno_id, data, hora, duracao, obs || null);

    const d = new Date(data);
    await get().carregarCalendario(d.getMonth() + 1, d.getFullYear());
  },

  adicionarAula: async (dados) => {
    const db = await getDatabase();
    await db.runAsync(`
      INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, observacoes, tipo_aula, horario_recorrente_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, dados.aluno_id, dados.data_aula, dados.hora_inicio, dados.duracao_minutos, dados.presenca, dados.observacoes || null, dados.tipo_aula, dados.horario_recorrente_id || null);

    const d = new Date(dados.data_aula);
    await get().carregarCalendario(d.getMonth() + 1, d.getFullYear());
  },

  cancelarAula: async (aula) => {
    const db = await getDatabase();

    // Ensure recorrencia_id is null if undefined
    const recorrenciaId = aula.recorrencia_id ?? null;

    if (aula.tipo === 'VIRTUAL') {
      // Requer criar uma exceção na tabela de aulas para "matar" a virtual
      await db.runAsync(`
        INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, tipo_aula, horario_recorrente_id)
        VALUES (?, ?, ?, ?, 0, 'CANCELADA', ?);
      `, aula.aluno_id, aula.data, aula.hora, aula.duracao, recorrenciaId);
    } else {
      // Já é concreta, apenas atualiza status
      await db.runAsync(`UPDATE aulas SET tipo_aula = 'CANCELADA' WHERE id = ?`, aula.id ?? 0);
    }

    const d = new Date(aula.data);
    await get().carregarCalendario(d.getMonth() + 1, d.getFullYear());
  },

  confirmarAula: async (aula) => {
    // Transforma virtual em realizada (concreta)
    const db = await getDatabase();
    const recorrenciaId = aula.recorrencia_id ?? null;

    if (aula.tipo === 'VIRTUAL') {
      await db.runAsync(`
        INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, tipo_aula, horario_recorrente_id)
        VALUES (?, ?, ?, ?, 1, 'REALIZADA', ?);
      `, aula.aluno_id, aula.data, aula.hora, aula.duracao, recorrenciaId);
    } else {
      await db.runAsync(`UPDATE aulas SET presenca = 1, tipo_aula = 'REALIZADA' WHERE id = ?`, aula.id ?? 0);
    }
    const d = new Date(aula.data);
    await get().carregarCalendario(d.getMonth() + 1, d.getFullYear());
  },

  obterAulasDoAluno: async (aluno_id: number, inicio: Date, fim: Date) => {
    const db = await getDatabase();
    const inicioStr = inicio.toISOString().slice(0, 10);
    const fimStr = fim.toISOString().slice(0, 10);

    // Buscar Regras
    const regras = await db.getAllAsync<RegraRecorrencia>(`
      SELECT id, aluno_id, dia_semana, hora_inicio, duracao_minutos, data_inicio_vigencia, data_fim_vigencia 
      FROM horarios_recorrentes 
      WHERE aluno_id = ?
      AND data_inicio_vigencia <= ? 
      AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= ?)
    `, aluno_id, fimStr, inicioStr);

    // Buscar Concretas
    const eventos = await db.getAllAsync<any>(`
      SELECT id, aluno_id, data_aula, hora_inicio, tipo_aula, presenca as status_presenca, observacoes, horario_recorrente_id as recorrencia_id
      FROM aulas 
      WHERE aluno_id = ?
      AND data_aula BETWEEN ? AND ?
      AND tipo_aula != 'RECORRENTE_GERADA'
    `, aluno_id, inicioStr, fimStr);

    const eventosConcretos: EventoConcreto[] = eventos.map((e: any) => ({
      ...e,
      tipo_aula: e.tipo_aula as any
    }));

    return gerarCalendarioVisual(inicio, fim, regras, eventosConcretos);
  },

  listarRegrasAtivas: async (aluno_id: number) => {
    const db = await getDatabase();
    // Regras que ainda estão valendo (data_fim NULL ou futura)
    const hojeStr = new Date().toISOString().slice(0, 10);
    const regras = await db.getAllAsync<RegraRecorrencia>(`
      SELECT id, aluno_id, dia_semana, hora_inicio, duracao_minutos, data_inicio_vigencia, data_fim_vigencia 
      FROM horarios_recorrentes 
      WHERE aluno_id = ?
      AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= ?)
      ORDER BY dia_semana, hora_inicio
    `, aluno_id, hojeStr);
    return regras;
  },

  encerrarRegraRecorrente: async (regra_id: number) => {
    const db = await getDatabase();
    // Define o fim da vigência para ontem, encerrando a regra para o futuro
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().slice(0, 10);

    await db.runAsync(`
      UPDATE horarios_recorrentes 
      SET data_fim_vigencia = ? 
      WHERE id = ?
    `, ontemStr, regra_id);

    // Recarregar calendário
    const hoje = new Date();
    await get().carregarCalendario(hoje.getMonth() + 1, hoje.getFullYear());
  }

}));

export default useAulasStore; 