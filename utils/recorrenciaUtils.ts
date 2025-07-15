import { getDatabase } from './databaseUtils';
import { Aula, TipoAula } from '../store/useAulasStore';

// Função para pegar todas as datas de um dia da semana entre duas datas
function getAllWeekdaysInRange(start: string, end: string, weekday: number): string[] {
  const dates: string[] = [];
  let current = new Date(start);
  const endDate = new Date(end);
  
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
  console.log(`[DATAS] 🎯 Gerando datas para ${diasSemana[weekday]} (${weekday})`);
  console.log(`[DATAS] 📅 Período: ${start} até ${end}`);
  console.log(`[DATAS] 📅 Data inicial: ${current.toISOString()} (${diasSemana[current.getDay()]})`);

  // Ajusta para o primeiro dia da semana desejado
  while (current.getDay() !== weekday) {
    current.setDate(current.getDate() + 1);
    console.log(`[DATAS] ⏭️  Avançando para: ${current.toISOString()} (${diasSemana[current.getDay()]})`);
  }

  console.log(`[DATAS] ✅ Primeira data alinhada: ${current.toISOString()} (${diasSemana[current.getDay()]})`);

  while (current <= endDate) {
    const dataFormatada = current.toISOString().slice(0, 10);
    
    // VALIDAÇÃO DUPLA: verificar se a data gerada realmente é do dia correto
    const dataObj = new Date(dataFormatada);
    const diaSemanaGerado = dataObj.getDay();
    
    if (diaSemanaGerado === weekday) {
      dates.push(dataFormatada);
      console.log(`[DATAS] ✅ Adicionada: ${dataFormatada} (${diasSemana[diaSemanaGerado]})`);
    } else {
      console.log(`[DATAS] ❌ REJEITADA: ${dataFormatada} deveria ser ${diasSemana[weekday]} mas é ${diasSemana[diaSemanaGerado]}`);
    }
    
    current.setDate(current.getDate() + 7);
  }
  
  console.log(`[DATAS] 📊 Total de datas válidas geradas: ${dates.length}`);
  console.log(`[DATAS] 📋 Datas válidas: ${dates.join(', ')}`);
  
  return dates;
}

export async function gerarAulasRecorrentesParaPeriodo(periodoInicio: string, periodoFim: string, aluno_id?: number) {
  const db = await getDatabase();
  
  console.log(`[RECORRENCIA] 🚀 Iniciando geração de aulas recorrentes`);
  console.log(`[RECORRENCIA] 📅 Período: ${periodoInicio} até ${periodoFim}`);
  console.log(`[RECORRENCIA] 👤 Aluno ID: ${aluno_id || 'Todos'}`);
  
  // Buscar "horários recorrentes" a partir das aulas com RRULE
  const horarios = await db.getAllAsync<any>(
    `SELECT id, aluno_id, strftime('%w', data_aula) as dia_semana, hora_inicio, duracao_minutos, rrule
     FROM aulas
     WHERE tipo_aula = 'RECORRENTE' AND rrule IS NOT NULL
     ${aluno_id ? 'AND aluno_id = ?' : ''}
     GROUP BY aluno_id, dia_semana, hora_inicio, duracao_minutos, rrule`,
    ...(aluno_id ? [aluno_id] : [])
  );
  
  console.log(`[RECORRENCIA] 📋 Encontrados ${horarios.length} horários recorrentes`);
  
  if (!horarios || horarios.length === 0) {
    console.log(`[RECORRENCIA] ⚠️  Nenhum horário recorrente encontrado`);
    return;
  }

  for (const horario of horarios) {
    const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
    console.log(`\n[RECORRENCIA] 🔄 Processando horário ID ${horario.id}:`);
    console.log(`[RECORRENCIA] 👤 Aluno: ${horario.aluno_id}`);
    console.log(`[RECORRENCIA] 📅 Dia: ${horario.dia_semana} (${diasSemana[horario.dia_semana]})`);
    console.log(`[RECORRENCIA] 🕐 Hora: ${horario.hora_inicio}`);
    console.log(`[RECORRENCIA] ⏱️  Duração: ${horario.duracao_minutos}min`);
    console.log(`[RECORRENCIA] 📆 Vigência: ${horario.data_inicio_vigencia || 'Sem início'} até ${horario.data_fim_vigencia || 'Sem fim'}`);
    
    // Gera apenas as datas do dia da semana correto
    const datas = getAllWeekdaysInRange(periodoInicio, periodoFim, horario.dia_semana);
    
    console.log(`[RECORRENCIA] 📊 Processando ${datas.length} datas geradas`);
    
    for (const data of datas) {
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      const dataObj = new Date(data);
      const diaSemanaData = dataObj.getDay();
      const diaSemanaHorario = horario.dia_semana;
      
      console.log(`[RECORRENCIA] 🔍 Verificando data: ${data} (${diasSemana[diaSemanaData]}) vs Horário ${diasSemana[diaSemanaHorario]}`);
      
      // VALIDAÇÃO RIGOROSA - PRIMEIRA VERIFICAÇÃO
      if (diaSemanaData !== diaSemanaHorario) {
        console.log(`[VALIDAÇÃO] ❌ REJEITADA: ${data} é ${diasSemana[diaSemanaData]} mas horário é para ${diasSemana[diaSemanaHorario]}`);
        console.log(`[VALIDAÇÃO] ❌ MOTIVO: Dia da semana não coincide`);
        continue; // Pula datas que não correspondem ao dia da semana
      }
      
      // Validação adicional: verificar se a data é válida
      const dataValida = !isNaN(dataObj.getTime());
      if (!dataValida) {
        console.log(`[VALIDAÇÃO] ❌ REJEITADA: ${data} não é uma data válida`);
        continue;
      }
      
      // Validação de formato da data
      const formatoData = /^\d{4}-\d{2}-\d{2}$/.test(data);
      if (!formatoData) {
        console.log(`[VALIDAÇÃO] ❌ REJEITADA: ${data} não está no formato YYYY-MM-DD`);
        continue;
      }
      
      console.log(`[VALIDAÇÃO] ✅ APROVADA: ${data} (${diasSemana[diaSemanaData]}) = Horário ${diasSemana[diaSemanaHorario]}`);
      
      // 3. Verificar se já existe aula para esse aluno/data/hora
      console.log(`[RECORRENCIA] 🔍 Verificando se aula já existe: ${data} ${horario.hora_inicio} - Aluno ${horario.aluno_id}`);
      
      // Verificação mais abrangente - qualquer aula para esse aluno/data/hora
      const existe = await db.getFirstAsync<any>(
        `SELECT * FROM aulas WHERE aluno_id = ? AND data_aula = ? AND hora_inicio = ?`,
        horario.aluno_id, data, horario.hora_inicio
      );
      
      if (existe) {
        console.log(`[RECORRENCIA] ⏭️  PULANDO: Aula já existe para ${data} ${horario.hora_inicio} (ID: ${existe.id}, Tipo: ${existe.tipo_aula})`);
        continue; // Já existe exceção ou aula
      }
      
      console.log(`[RECORRENCIA] ✅ Aula não existe, prosseguindo com criação...`);
      
      // 4. Verificar vigência (só se estiver definida)
      if (horario.data_inicio_vigencia && horario.data_inicio_vigencia.trim() !== '' && data < horario.data_inicio_vigencia) {
        console.log(`[RECORRENCIA] ⏭️  PULANDO: Data ${data} antes da vigência ${horario.data_inicio_vigencia}`);
        continue;
      }
      if (horario.data_fim_vigencia && horario.data_fim_vigencia.trim() !== '' && data > horario.data_fim_vigencia) {
        console.log(`[RECORRENCIA] ⏭️  PULANDO: Data ${data} após a vigência ${horario.data_fim_vigencia}`);
        continue;
      }
      
      // 5. Inserir aula recorrente (apenas se passou por todas as validações)
      console.log(`[RECORRENCIA] 💾 SALVANDO: ${data} ${horario.hora_inicio} - Aluno ${horario.aluno_id}`);
      await db.runAsync(
        `INSERT INTO aulas (aluno_id, data_aula, hora_inicio, duracao_minutos, presenca, observacoes, tipo_aula, horario_recorrente_id, rrule, data_avulsa, sobrescrita_id, cancelada_por_id)
         VALUES (?, ?, ?, ?, 0, NULL, 'RECORRENTE', ?, NULL, NULL, NULL, NULL);`,
        horario.aluno_id, data, horario.hora_inicio, horario.duracao_minutos, horario.id
      );
      console.log(`[RECORRENCIA] ✅ SALVA: Aula criada com sucesso`);
    }
  }
  
  console.log(`[RECORRENCIA] 🎉 Geração de aulas recorrentes concluída`);
} 