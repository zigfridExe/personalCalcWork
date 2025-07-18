import { getDatabase } from './databaseUtils';

// Função para pegar todas as datas de um dia da semana entre duas datas
function getAllWeekdaysInRange(start: string, end: string, weekday: number): string[] {
  const dates: string[] = [];
  let current = new Date(start);
  const endDate = new Date(end);
  while (current.getDay() !== weekday) {
    current.setDate(current.getDate() + 1);
  }
  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

// Gera aulas recorrentes materializadas para o período informado
export async function gerarAulasRecorrentesParaPeriodo(periodoInicio: string, periodoFim: string, aluno_id?: number) {
  const db = await getDatabase();
  console.log(`[RECORRENCIA] 🚀 Iniciando geração de aulas recorrentes`);
  console.log(`[RECORRENCIA] 📅 Período: ${periodoInicio} até ${periodoFim}`);
  console.log(`[RECORRENCIA] 👤 Aluno ID: ${aluno_id || 'Todos'}`);

  // Buscar padrões de horários recorrentes
  const horarios = await db.getAllAsync<any>(
    `SELECT * FROM horarios_recorrentes ${aluno_id ? 'WHERE aluno_id = ?' : ''}`,
    ...(aluno_id ? [aluno_id] : [])
  );
  if (!horarios || horarios.length === 0) {
    console.log(`[RECORRENCIA] ⚠️  Nenhum horário recorrente encontrado`);
    return;
  }

  for (const horario of horarios) {
    const datas = getAllWeekdaysInRange(periodoInicio, periodoFim, horario.dia_semana);
    for (const data of datas) {
      // Priorizar exceções/avulsas: não gerar se já existe aula para esse aluno/data/hora
      const existe = await db.getFirstAsync<any>(
        `SELECT * FROM aulas WHERE aluno_id = ? AND data_aula = ? AND hora_inicio = ? AND (tipo_aula != 'RECORRENTE_GERADA')`,
        horario.aluno_id, data, horario.hora_inicio
      );
      if (existe) continue;
      // Não gerar duplicata de recorrente
      const existeRecorrente = await db.getFirstAsync<any>(
        `SELECT * FROM aulas WHERE aluno_id = ? AND data_aula = ? AND hora_inicio = ? AND tipo_aula = 'RECORRENTE_GERADA'`,
        horario.aluno_id, data, horario.hora_inicio
      );
      if (existeRecorrente) continue;
      // Vigência
      if (horario.data_inicio_vigencia && data < horario.data_inicio_vigencia) continue;
      if (horario.data_fim_vigencia && data > horario.data_fim_vigencia) continue;
      // Inserir aula recorrente materializada
      await db.runAsync(
        `INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, observacoes, tipo_aula, horario_recorrente_id)
         VALUES (?, ?, ?, ?, 0, NULL, 'RECORRENTE_GERADA', ?);`,
        horario.aluno_id, data, horario.hora_inicio, horario.duracao_minutos, horario.id
      );
    }
  }
  console.log(`[RECORRENCIA] 🎉 Geração de aulas recorrentes concluída`);
} 