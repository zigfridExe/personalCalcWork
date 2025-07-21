import { getDatabase } from './databaseUtils';

// Função para pegar todas as datas de um dia da semana entre duas datas
function getAllWeekdaysInRange(start: string, end: string, weekday: number): string[] {
  const dates: string[] = [];
  let current = new Date(start + 'T00:00:00'); // Garante horário local
  const endDate = new Date(end + 'T00:00:00');
  while (current.getDay() !== weekday) {
    current.setDate(current.getDate() + 1);
  }
  while (current <= endDate) {
    // Monta a data manualmente para evitar problemas de timezone
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
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

  let totalGeradas = 0;
  let totalPuladas = 0;

  for (const horario of horarios) {
    const datas = getAllWeekdaysInRange(periodoInicio, periodoFim, horario.dia_semana);
    for (const data of datas) {
      // Priorizar exceções/avulsas: não gerar se já existe aula para esse aluno/data/hora
      const existe = await db.getFirstAsync<any>(
        `SELECT * FROM aulas WHERE aluno_id = ? AND data_aula = ? AND hora_inicio = ? AND (tipo_aula != 'RECORRENTE_GERADA')`,
        horario.aluno_id, data, horario.hora_inicio
      );
      if (existe) {
        console.log(`[RECORRENCIA] ⏭️ ${data} - Aluno ${horario.aluno_id} - Hora ${horario.hora_inicio}: Já existe aula do tipo '${existe.tipo_aula}' (pulado)`);
        totalPuladas++;
        continue;
      }
      // Não gerar duplicata de recorrente
      const existeRecorrente = await db.getFirstAsync<any>(
        `SELECT * FROM aulas WHERE aluno_id = ? AND data_aula = ? AND hora_inicio = ? AND tipo_aula = 'RECORRENTE_GERADA'`,
        horario.aluno_id, data, horario.hora_inicio
      );
      if (existeRecorrente) {
        console.log(`[RECORRENCIA] ⏭️ ${data} - Aluno ${horario.aluno_id} - Hora ${horario.hora_inicio}: Já existe aula recorrente materializada (pulado)`);
        totalPuladas++;
        continue;
      }
      // Vigência
      if (horario.data_inicio_vigencia && data < horario.data_inicio_vigencia) {
        console.log(`[RECORRENCIA] ⏭️ ${data} - Aluno ${horario.aluno_id} - Hora ${horario.hora_inicio}: Fora da vigência (início em ${horario.data_inicio_vigencia}) (pulado)`);
        totalPuladas++;
        continue;
      }
      if (horario.data_fim_vigencia && data > horario.data_fim_vigencia) {
        console.log(`[RECORRENCIA] ⏭️ ${data} - Aluno ${horario.aluno_id} - Hora ${horario.hora_inicio}: Fora da vigência (fim em ${horario.data_fim_vigencia}) (pulado)`);
        totalPuladas++;
        continue;
      }
      // Inserir aula recorrente materializada
      await db.runAsync(
        `INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, observacoes, tipo_aula, horario_recorrente_id)
         VALUES (?, ?, ?, ?, 0, NULL, 'RECORRENTE_GERADA', ?);`,
        horario.aluno_id, data, horario.hora_inicio, horario.duracao_minutos, horario.id
      );
      console.log(`[RECORRENCIA] ✅ ${data} - Aluno ${horario.aluno_id} - Hora ${horario.hora_inicio}: Aula recorrente materializada!`);
      totalGeradas++;
    }
  }
  console.log(`[RECORRENCIA] 🎉 Geração de aulas recorrentes concluída. Total geradas: ${totalGeradas}, puladas: ${totalPuladas}`);
}

// Log detalhado de geração de aulas recorrentes para um mês
export async function logDetalhadoAulasRecorrentes(ano: number, mes: number) {
  const db = await getDatabase();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const recorrentes = await db.getAllAsync<any>('SELECT * FROM horarios_recorrentes');
  const aulas = await db.getAllAsync<any>('SELECT * FROM aulas');

  console.log('--- LOG DETALHADO DE GERAÇÃO DE AULAS RECORRENTES ---');
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const data = new Date(ano, mes, d);
    const dataISO = data.toISOString().slice(0, 10);
    const diaSemana = data.getDay();
    const recorrentesDia = recorrentes.filter(r => Number(r.dia_semana) === diaSemana);
    if (recorrentesDia.length === 0) {
      console.log(`Dia: ${dataISO} (${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][diaSemana]}) | Sem padrão recorrente.`);
      continue;
    }
    for (const r of recorrentesDia) {
      let motivo = '';
      // Vigência
      if (r.data_inicio_vigencia && dataISO < r.data_inicio_vigencia) {
        motivo = `Fora da vigência (início em ${r.data_inicio_vigencia})`;
      } else if (r.data_fim_vigencia && dataISO > r.data_fim_vigencia) {
        motivo = `Fora da vigência (fim em ${r.data_fim_vigencia})`;
      } else {
        // Já existe aula avulsa/exceção
        const existe = aulas.find(a => a.aluno_id === r.aluno_id && a.data_aula === dataISO && a.hora_inicio === r.hora_inicio && a.tipo_aula !== 'RECORRENTE_GERADA');
        if (existe) {
          motivo = `Já existe aula do tipo '${existe.tipo_aula}' para o aluno ${r.aluno_id}`;
        } else {
          // Já existe recorrente
          const existeRecorrente = aulas.find(a => a.aluno_id === r.aluno_id && a.data_aula === dataISO && a.hora_inicio === r.hora_inicio && a.tipo_aula === 'RECORRENTE_GERADA');
          if (existeRecorrente) {
            motivo = `Aula recorrente já materializada (ID: ${existeRecorrente.id})`;
          } else {
            motivo = 'Aula recorrente seria gerada';
          }
        }
      }
      console.log(`Dia: ${dataISO} (${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][diaSemana]}) | Aluno: ${r.aluno_id} | Hora: ${r.hora_inicio} | Motivo: ${motivo}`);
    }
  }
} 