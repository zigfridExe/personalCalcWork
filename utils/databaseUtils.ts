import * as SQLite from 'expo-sqlite';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!databaseInstance) {
    try {
      databaseInstance = await SQLite.openDatabaseAsync('personaltrainer.db');
      console.log('Banco de dados aberto com sucesso');
    } catch (error) {
      console.error('Erro ao abrir banco de dados:', error);
      throw error;
    }
  }
  return databaseInstance;
};

export const closeDatabase = async () => {
  if (databaseInstance) {
    try {
      await databaseInstance.closeAsync();
      databaseInstance = null;
      console.log('Banco de dados fechado com sucesso');
    } catch (error) {
      console.error('Erro ao fechar banco de dados:', error);
    }
  }
};

/**
 * Reinicia a conexão com o banco de dados.
 */
export const reiniciarConexaoBanco = async () => {
  try {
    console.log('Reiniciando conexão com o banco de dados...');
    await closeDatabase();
    databaseInstance = null;
    await getDatabase();
    console.log('Conexão com o banco reiniciada com sucesso!');
  } catch (error) {
    console.error('Erro ao reiniciar conexão:', error);
    throw error;
  }
};

/**
 * Testa se o banco de dados está funcionando.
 */
export const testarBanco = async () => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync('SELECT 1 as test');
    console.log('✅ Banco de dados funcionando corretamente!');
    return true;
  } catch (error) {
    console.error('❌ Banco de dados com problema:', error);
    return false;
  }
};

export const checkAndFixDatabase = async () => {
  const db = await getDatabase();

  try {
    console.log('Verificando estrutura do banco de dados...');

    // Verificar se a tabela exercicios existe
    const tableExists = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='exercicios';");

    if (tableExists.length === 0) {
      console.log('Tabela exercicios não existe. Criando...');
      await createExerciciosTable(db);
    } else {
      // Verificar se a coluna ficha_id existe
      const columns = await db.getAllAsync("PRAGMA table_info(exercicios);");
      const hasFichaId = columns.some((col: any) => col.name === 'ficha_id');

      if (!hasFichaId) {
        console.log('Coluna ficha_id não encontrada. Recriando tabela exercicios...');
        await db.execAsync('DROP TABLE IF EXISTS exercicios;');
        await createExerciciosTable(db);
      }
    }

    // Verificar se a tabela alunos existe e se a coluna lembrete_hidratacao_minutos existe
    const alunosTableExists = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='alunos';");
    if (alunosTableExists.length > 0) {
      const alunosColumns = await db.getAllAsync("PRAGMA table_info(alunos);");
      const hasLembreteHidratacao = alunosColumns.some((col: any) => col.name === 'lembrete_hidratacao_minutos');
      if (!hasLembreteHidratacao) {
        console.log('Coluna lembrete_hidratacao_minutos não encontrada. Adicionando...');
        await db.execAsync('ALTER TABLE alunos ADD COLUMN lembrete_hidratacao_minutos INTEGER;');
        console.log('Coluna lembrete_hidratacao_minutos adicionada com sucesso.');
      }
      // Migração para peso, altura e imc
      const hasPeso = alunosColumns.some((col: any) => col.name === 'peso');
      if (!hasPeso) {
        console.log('Coluna peso não encontrada. Adicionando...');
        await db.execAsync('ALTER TABLE alunos ADD COLUMN peso REAL;');
        console.log('Coluna peso adicionada com sucesso.');
      }
      const hasAltura = alunosColumns.some((col: any) => col.name === 'altura');
      if (!hasAltura) {
        console.log('Coluna altura não encontrada. Adicionando...');
        await db.execAsync('ALTER TABLE alunos ADD COLUMN altura REAL;');
        console.log('Coluna altura adicionada com sucesso.');
      }
      const hasImc = alunosColumns.some((col: any) => col.name === 'imc');
      if (!hasImc) {
        console.log('Coluna imc não encontrada. Adicionando...');
        await db.execAsync('ALTER TABLE alunos ADD COLUMN imc REAL;');
        console.log('Coluna imc adicionada com sucesso.');
      }
    }

    // Verificar se a tabela medidas existe
    const medidasTableExists = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='medidas';");
    if (medidasTableExists.length === 0) {
      console.log('Tabela medidas não existe. Criando...');
      await db.execAsync(`
        CREATE TABLE medidas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER,
          data TEXT,
          peso REAL,
          altura REAL,
          cintura REAL,
          quadril REAL,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
        );
      `);
      console.log('Tabela medidas criada com sucesso.');
    }

    // Verificar se a tabela aulas existe
    const aulasTableExists = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='aulas';");
    if (aulasTableExists.length === 0) {
      console.log('Tabela aulas não existe. Criando...');
      await db.execAsync(`
        CREATE TABLE aulas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER,
          data_aula TEXT,
          hora_inicio TEXT,
          duracao_minutos INTEGER,
          presenca INTEGER DEFAULT 0,
          observacoes TEXT,
          tipo_aula TEXT,
          horario_recorrente_id INTEGER,
          rrule TEXT,
          data_avulsa TEXT,
          sobrescrita_id INTEGER,
          cancelada_por_id INTEGER,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
        );
      `);
      console.log('Tabela aulas criada com sucesso.');
    } else {
      await migrarTabelaAulas();
    }

    console.log('Verificação do banco de dados concluída.');
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    throw error;
  }
};

const createExerciciosTable = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE exercicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ficha_id INTEGER,
      grupo_muscular TEXT,
      nome TEXT,
      maquina TEXT,
      series TEXT,
      repeticoes TEXT,
      carga TEXT,
      ajuste TEXT,
      observacoes TEXT,
      descanso TEXT,
      FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
    );
  `);
  console.log('Tabela exercicios criada com sucesso.');
};

export const migrarTabelaAulas = async () => {
  const db = await getDatabase();
  // Verifica colunas existentes
  const columns = await db.getAllAsync("PRAGMA table_info(aulas);");
  const colNames = columns.map((col: any) => col.name);
  // Renomeia colunas antigas se existirem
  if (colNames.includes('data')) {
    await db.execAsync('ALTER TABLE aulas RENAME COLUMN data TO data_aula;');
  }
  if (colNames.includes('hora')) {
    await db.execAsync('ALTER TABLE aulas RENAME COLUMN hora TO hora_inicio;');
  }
  if (colNames.includes('descricao')) {
    await db.execAsync('ALTER TABLE aulas RENAME COLUMN descricao TO observacoes;');
  }
  // Adiciona colunas que faltam
  const addIfMissing = async (col: string, type: string) => {
    if (!colNames.includes(col)) {
      await db.execAsync(`ALTER TABLE aulas ADD COLUMN ${col} ${type};`);
    }
  };
  await addIfMissing('duracao_minutos', 'INTEGER');
  await addIfMissing('tipo_aula', 'TEXT');
  await addIfMissing('horario_recorrente_id', 'INTEGER');
  await addIfMissing('rrule', 'TEXT'); // NOVO: recorrência
  await addIfMissing('data_avulsa', 'TEXT'); // NOVO: data única
  await addIfMissing('sobrescrita_id', 'INTEGER'); // NOVO: sobrescrita
  await addIfMissing('cancelada_por_id', 'INTEGER'); // NOVO: cancelamento
};

export const resetDatabase = async () => {
  const db = await getDatabase();

  try {
    console.log('Resetando banco de dados...');

    // Dropar todas as tabelas
    await db.execAsync('DROP TABLE IF EXISTS historico_series;');
    await db.execAsync('DROP TABLE IF EXISTS historico_treinos;');
    await db.execAsync('DROP TABLE IF EXISTS frequencia;');
    await db.execAsync('DROP TABLE IF EXISTS exercicios;');
    await db.execAsync('DROP TABLE IF EXISTS treinos;');
    await db.execAsync('DROP TABLE IF EXISTS atividades_adicionais;');
    await db.execAsync('DROP TABLE IF EXISTS fichas;');
    await db.execAsync('DROP TABLE IF EXISTS alunos;');
    await db.execAsync('DROP TABLE IF EXISTS aulas;');
    await db.execAsync('DROP TABLE IF EXISTS medidas;');

    // Recriar todas as tabelas
    await db.execAsync(`
      CREATE TABLE alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        status TEXT,
        contato TEXT,
        foto_uri TEXT,
        data_nascimento TEXT,
        lembrete_hidratacao_minutos INTEGER,
        peso REAL,
        altura REAL,
        imc REAL
      );

      CREATE TABLE fichas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER,
        nome TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        objetivos TEXT,
        observacoes TEXT,
        professor TEXT,
        descanso_padrao TEXT,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
      );

      CREATE TABLE treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ficha_id INTEGER,
        nome TEXT,
        FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
      );

      CREATE TABLE exercicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ficha_id INTEGER,
        grupo_muscular TEXT,
        nome TEXT,
        maquina TEXT,
        series TEXT,
        repeticoes TEXT,
        carga TEXT,
        ajuste TEXT,
        observacoes TEXT,
        descanso TEXT,
        FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
      );

      CREATE TABLE atividades_adicionais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ficha_id INTEGER,
        tipo TEXT,
        descricao TEXT,
        FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
      );

      CREATE TABLE frequencia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER,
        data TEXT,
        treino_id INTEGER,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE,
        FOREIGN KEY (treino_id) REFERENCES treinos (id) ON DELETE CASCADE
      );

      CREATE TABLE historico_treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ficha_id INTEGER,
        aluno_id INTEGER,
        data_inicio TEXT,
        data_fim TEXT,
        duracao_minutos INTEGER,
        observacoes TEXT,
        FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
      );

      CREATE TABLE historico_series (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        historico_treino_id INTEGER,
        exercicio_id INTEGER,
        serie_numero INTEGER,
        repeticoes TEXT,
        carga TEXT,
        observacoes TEXT,
        FOREIGN KEY (historico_treino_id) REFERENCES historico_treinos (id) ON DELETE CASCADE,
        FOREIGN KEY (exercicio_id) REFERENCES exercicios (id) ON DELETE CASCADE
      );

      CREATE TABLE aulas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER,
        data_aula TEXT,
        hora_inicio TEXT,
        duracao_minutos INTEGER,
        presenca INTEGER DEFAULT 0,
        observacoes TEXT,
        tipo_aula TEXT,
        horario_recorrente_id INTEGER,
        rrule TEXT,
        data_avulsa TEXT,
        sobrescrita_id INTEGER,
        cancelada_por_id INTEGER,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
      );

      CREATE TABLE medidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER,
        data TEXT,
        peso REAL,
        altura REAL,
        cintura REAL,
        quadril REAL,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
      );
    `);

    console.log('Banco de dados resetado com sucesso.');
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  const db = await getDatabase();

  try {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS alunos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          status TEXT,
          contato TEXT,
          foto_uri TEXT,
          data_nascimento TEXT,
          lembrete_hidratacao_minutos INTEGER,
          peso REAL,
          altura REAL,
          imc REAL
        );

        CREATE TABLE IF NOT EXISTS fichas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER,
          nome TEXT,
          data_inicio TEXT,
          data_fim TEXT,
          objetivos TEXT,
          observacoes TEXT,
          professor TEXT,
          descanso_padrao TEXT,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS treinos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ficha_id INTEGER,
          nome TEXT,
          FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS exercicios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ficha_id INTEGER,
          grupo_muscular TEXT,
          nome TEXT,
          maquina TEXT,
          series TEXT,
          repeticoes TEXT,
          carga TEXT,
          ajuste TEXT,
          observacoes TEXT,
          descanso TEXT,
          FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS atividades_adicionais (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ficha_id INTEGER,
          tipo TEXT,
          descricao TEXT,
          FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS frequencia (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER,
          data TEXT,
          treino_id INTEGER,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE,
          FOREIGN KEY (treino_id) REFERENCES treinos (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS historico_treinos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ficha_id INTEGER,
          aluno_id INTEGER,
          data_inicio TEXT,
          data_fim TEXT,
          duracao_minutos INTEGER,
          observacoes TEXT,
          FOREIGN KEY (ficha_id) REFERENCES fichas (id) ON DELETE CASCADE,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS historico_series (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          historico_treino_id INTEGER,
          exercicio_id INTEGER,
          serie_numero INTEGER,
          repeticoes TEXT,
          carga TEXT,
          observacoes TEXT,
          FOREIGN KEY (historico_treino_id) REFERENCES historico_treinos (id) ON DELETE CASCADE,
          FOREIGN KEY (exercicio_id) REFERENCES exercicios (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS horarios_recorrentes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          aluno_id INTEGER,
          dia_semana INTEGER, -- 0=Dom, 1=Seg...
          hora_inicio TEXT, -- HH:MM
          duracao_minutos INTEGER DEFAULT 60,
          data_inicio_vigencia TEXT, -- YYYY-MM-DD
          data_fim_vigencia TEXT, -- Nullable
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
        );
      `);

      // Migração: adicionar coluna descanso se não existir
      try {
        await db.execAsync('ALTER TABLE exercicios ADD COLUMN descanso TEXT;');
        console.log('Coluna descanso adicionada à tabela exercicios.');
      } catch (error) {
        // Coluna já existe, ignorar erro
        console.log('Coluna descanso já existe na tabela exercicios.');
      }

      // Migração: adicionar coluna medidas se não existir
      try {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS medidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER,
            data TEXT,
            peso REAL,
            altura REAL,
            cintura REAL,
            quadril REAL,
            FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
          );
        `);
        console.log('Tabela medidas criada/verificada com sucesso.');
      } catch (error) {
        console.error('Erro ao criar/verificar tabela medidas:', error);
      }

      // Migração: adicionar coluna aulas se não existir
      try {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS aulas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER,
            data TEXT,
            hora TEXT,
            descricao TEXT,
            presenca INTEGER DEFAULT 0,
            FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
          );
        `);
        console.log('Tabela aulas criada com sucesso.');
      } catch (error) {
        console.error('Erro ao criar/verificar tabela aulas:', error);
      }

      // MIGRAÇÃO: Adiciona a coluna data_nascimento se não existir
      await db.execAsync(`
        PRAGMA foreign_keys=off;
        BEGIN TRANSACTION;
        CREATE TABLE IF NOT EXISTS temp_alunos_migracao AS SELECT * FROM alunos;
        ALTER TABLE alunos ADD COLUMN data_nascimento TEXT;
        COMMIT;
        PRAGMA foreign_keys=on;
      `).catch(() => { }); // Ignora erro se a coluna já existir

      // Migração: adicionar coluna tempo_cadencia se não existir
      try {
        await db.execAsync('ALTER TABLE historico_series ADD COLUMN tempo_cadencia INTEGER;');
        console.log('Coluna tempo_cadencia adicionada à tabela historico_series.');
      } catch (error) {
        // Coluna já existe, ignorar erro
        console.log('Coluna tempo_cadencia já existe na tabela historico_series.');
      }
    });

    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

/**
 * Remove todas as aulas (recorrentes e avulsas) do banco
 */
export const limparTodasAulas = async () => {
  const db = await getDatabase();
  try {
    console.log('🧹 Limpando TODAS as aulas (recorrentes e avulsas)...');
    const result = await db.runAsync('DELETE FROM aulas;');
    console.log(`✅ Removidas ${result.changes} aulas do banco!`);
    return result.changes;
  } catch (error) {
    console.error('❌ Erro ao limpar todas as aulas:', error);
    throw error;
  }
};

/**
 * Remove apenas aulas duplicadas (mantém uma de cada combinação aluno/data/hora/observacoes)
 */
export const limparAulasDuplicadas = async () => {
  const db = await getDatabase();
  try {
    console.log('🧹 Removendo apenas aulas duplicadas...');
    // Seleciona as duplicatas (mantendo a menor id)
    const duplicatas = await db.getAllAsync<any>(`
      SELECT id FROM aulas WHERE id NOT IN (
        SELECT MIN(id) FROM aulas
        GROUP BY aluno_id, data_aula, hora_inicio, observacoes
      )
    `);
    if (duplicatas.length === 0) {
      console.log('✅ Nenhuma aula duplicada encontrada!');
      return 0;
    }
    const idsParaRemover = duplicatas.map((d: any) => d.id);
    await db.runAsync(`DELETE FROM aulas WHERE id IN (${idsParaRemover.join(',')});`);
    console.log(`✅ Removidas ${idsParaRemover.length} aulas duplicadas!`);
    return idsParaRemover.length;
  } catch (error) {
    console.error('❌ Erro ao limpar aulas duplicadas:', error);
    throw error;
  }
};

/**
 * MIGRATION V2: Limpa todas as aulas futuras que foram geradas estaticamente.
 * O novo sistema usa cálculo em tempo real.
 */
export const migrarParaNovoModeloCalendario = async () => {
  const db = await getDatabase();
  try {
    console.log('🔄 Migrando para Calendário V2 (On-Read)...');

    // 1. Remove futuras aulas geradas automaticamente
    // Mantém: Aulas passadas, aulas avulsas manuais, e qualquer coisa com presença marcada
    const hoje = new Date().toISOString().slice(0, 10);

    const result = await db.runAsync(`
      DELETE FROM aulas 
      WHERE tipo_aula = 'RECORRENTE_GERADA' 
      AND data_aula >= ?
      AND presenca = 0; -- Garante que não apaga se alguém já marcou presença
    `, hoje);

    console.log(`✅ Limpeza concluída: ${result.changes} aulas futuras estáticas removidas.`);

    // 2. Garante que índice de recorrência existe (para performance)
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_aulas_data ON aulas(data_aula);
      CREATE INDEX IF NOT EXISTS idx_recorrencia_vigencia ON horarios_recorrentes(data_inicio_vigencia, data_fim_vigencia);
    `);

    console.log('✅ Índices de performance criados.');
  } catch (error) {
    console.error('❌ Erro na migração V2:', error);
    throw error;
  }
};

/**
 * Lista todas as aulas e horários recorrentes do banco para debug.
 */
export const listarDadosBanco = async () => {
  const db = await getDatabase();
  try {
    console.log('=== DADOS DO BANCO DE DADOS ===');

    // Listar todas as aulas
    console.log('\n--- TODAS AS AULAS ---');
    const aulas = await db.getAllAsync<any>(`
      SELECT a.*, al.nome as aluno_nome 
      FROM aulas a 
      LEFT JOIN alunos al ON a.aluno_id = al.id 
      ORDER BY a.data_aula, a.hora_inicio
    `);
    console.log(`Total de aulas: ${aulas.length}`);

    // Agrupar por data para facilitar visualização
    const aulasPorData: { [key: string]: any[] } = {};
    aulas.forEach((aula: any) => {
      if (!aulasPorData[aula.data_aula]) {
        aulasPorData[aula.data_aula] = [];
      }
      aulasPorData[aula.data_aula].push(aula);
    });

    Object.keys(aulasPorData).sort().forEach(data => {
      const aulasDoDia = aulasPorData[data];
      const dataObj = new Date(data);
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      const diaSemana = diasSemana[dataObj.getDay()];

      console.log(`\n📅 ${data} (${diaSemana}) - ${aulasDoDia.length} aula(s):`);
      aulasDoDia.forEach((aula: any) => {
        console.log(`  • ID: ${aula.id} | Aluno: ${aula.aluno_nome || aula.aluno_id} | Hora: ${aula.hora_inicio} | Descrição: ${aula.observacoes} | Presença: ${aula.presenca}`);
      });
    });

    // Verificar duplicações
    console.log('\n--- VERIFICAÇÃO DE DUPLICAÇÕES ---');
    const duplicadas = await db.getAllAsync<any>(`
      SELECT aluno_id, data_aula, hora_inicio, observacoes, COUNT(*) as count
      FROM aulas 
      WHERE tipo_aula = 'RECORRENTE'
      GROUP BY aluno_id, data_aula, hora_inicio, observacoes
      HAVING COUNT(*) > 1
    `);

    if (duplicadas.length > 0) {
      console.log(`⚠️  ENCONTRADAS ${duplicadas.length} COMBINAÇÕES DUPLICADAS:`);
      duplicadas.forEach((dup: any) => {
        console.log(`  • ${dup.data_aula} ${dup.hora_inicio} - Aluno ${dup.aluno_id} - ${dup.count} aulas`);
      });
    } else {
      console.log('✅ Nenhuma duplicação encontrada!');
    }

    console.log('\n=== FIM DOS DADOS ===');
  } catch (error) {
    console.error('Erro ao listar dados do banco:', error);
    throw error;
  }
};

/**
 * Regenera todas as aulas recorrentes, removendo as antigas e criando novas.
 */
export const regenerarAulasRecorrentes = async () => {
  const db = await getDatabase();
  try {
    console.log('🔄 Regenerando aulas recorrentes...');

    // 1. Remover todas as aulas recorrentes existentes
    console.log('Removendo aulas recorrentes antigas...');
    const aulasRemovidas = await db.runAsync("DELETE FROM aulas WHERE tipo_aula = 'RECORRENTE';");
    console.log(`Removidas ${aulasRemovidas.changes} aulas recorrentes antigas`);

    // 3. Definir período para gerar aulas (próximos 6 meses)
    const hoje = new Date();
    const inicio = hoje.toISOString().slice(0, 10);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 6, 0).toISOString().slice(0, 10);

    console.log(`Gerando aulas de ${inicio} até ${fim}`);

    // 4. Gerar novas aulas recorrentes
    const { gerarAulasRecorrentesParaPeriodo } = await import('./recorrenciaUtils');
    await gerarAulasRecorrentesParaPeriodo(inicio, fim);

    console.log('✅ Aulas recorrentes regeneradas com sucesso!');
  } catch (error) {
    console.error('Erro ao regenerar aulas recorrentes:', error);
    throw error;
  }
};

export async function verificarAulasNoBanco(aluno_id?: number) {
  const db = await getDatabase();

  console.log('\n=== VERIFICAÇÃO DAS AULAS NO BANCO ===');

  // Verificar aulas
  let query = 'SELECT aulas.*, alunos.nome as aluno_nome FROM aulas LEFT JOIN alunos ON aulas.aluno_id = alunos.id';
  const params: any[] = [];

  if (aluno_id) {
    query += ' WHERE aulas.aluno_id = ?';
    params.push(aluno_id);
  }

  query += ' ORDER BY data_aula, hora_inicio LIMIT 20';

  const aulas = await db.getAllAsync<any>(query, params);
  console.log(`📚 Aulas encontradas: ${aulas.length}`);

  aulas.forEach((aula, i) => {
    const data = new Date(aula.data_aula);
    const diaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][data.getDay()];
    console.log(`  ${i + 1}. ${aula.data_aula} (${diaSemana}) ${aula.hora_inicio} - ${aula.aluno_nome} (${aula.observacoes})`);
  });

  console.log('=== FIM DA VERIFICAÇÃO ===\n');

  return { aulas };
}

/**
 * Limpa todas as RRULEs das aulas recorrentes (seta rrule = NULL)
 * Retorna o número de RRULEs limpas.
 */
export const limparTodasRRules = async () => {
  const db = await getDatabase();
  try {
    console.log('🧹 Limpando todas as RRULEs das aulas...');
    const result = await db.runAsync('UPDATE aulas SET rrule = NULL WHERE rrule IS NOT NULL;');
    console.log(`✅ RRULE limpas em ${result.changes} aulas!`);
    return result.changes;
  } catch (error) {
    console.error('❌ Erro ao limpar RRULEs:', error);
    throw error;
  }
};

/**
 * Deleta todas as aulas recorrentes (tipo_aula = 'RECORRENTE_GERADA') do banco.
 * Retorna o número de aulas deletadas.
 */
export const deletarTodasAulasRecorrentes = async () => {
  const db = await getDatabase();
  try {
    console.log('🗑️ Deletando todas as aulas recorrentes...');
    const result = await db.runAsync("DELETE FROM aulas WHERE tipo_aula = 'RECORRENTE_GERADA';");
    console.log(`✅ ${result.changes} aulas recorrentes deletadas!`);
    return result.changes;
  } catch (error) {
    console.error('❌ Erro ao deletar aulas recorrentes:', error);
    throw error;
  }
};

/**
 * Limpa RRULEs e deleta todas as aulas recorrentes (debug completo de recorrência)
 */
export const limparRecorrentesCompleto = async () => {
  // Remove apenas aulas do tipo 'RECORRENTE_GERADA'
  const deletadas = await deletarTodasAulasRecorrentes();
  console.log(`🧹 Limpeza completa: ${deletadas} recorrentes deletadas.`);
  return { deletadas };
};

/**
 * Deleta todas as aulas avulsas (tipo_aula = 'AVULSA') do banco.
 * Retorna o número de aulas deletadas.
 */
export const deletarTodasAulasAvulsas = async () => {
  const db = await getDatabase();
  try {
    console.log('🗑️ Deletando todas as aulas avulsas...');
    const result = await db.runAsync("DELETE FROM aulas WHERE tipo_aula = 'AVULSA';");
    console.log(`✅ ${result.changes} aulas avulsas deletadas!`);
    return result.changes;
  } catch (error) {
    console.error('❌ Erro ao deletar aulas avulsas:', error);
    throw error;
  }
};

/**
 * Deleta todas as aulas sobrescritas (tipo_aula = 'SOBREESCRITA') do banco.
 * Retorna o número de aulas deletadas.
 */
export const deletarTodasAulasSobrescritas = async () => {
  const db = await getDatabase();
  try {
    console.log('🗑️ Deletando todas as aulas sobrescritas...');
    const result = await db.runAsync("DELETE FROM aulas WHERE tipo_aula = 'SOBREESCRITA';");
    console.log(`✅ ${result.changes} aulas sobrescritas deletadas!`);
    return result.changes;
  } catch (error) {
    console.error('❌ Erro ao deletar aulas sobrescritas:', error);
    throw error;
  }
};

// MIGRAÇÃO: Refatoração do calendário (remover legados e criar novas estruturas)
export const migrarBancoCalendario = async () => {
  const db = await getDatabase();
  // Remover tabela presencas_recorrentes se existir
  await db.execAsync('DROP TABLE IF EXISTS presencas_recorrentes;');

  // Remover colunas legadas da tabela aulas (se existirem)
  try { await db.execAsync('ALTER TABLE aulas DROP COLUMN rrule;'); } catch (e) { }
  try { await db.execAsync('ALTER TABLE aulas DROP COLUMN data_avulsa;'); } catch (e) { }
  try { await db.execAsync('ALTER TABLE aulas DROP COLUMN sobrescrita_id;'); } catch (e) { }
  try { await db.execAsync('ALTER TABLE aulas DROP COLUMN cancelada_por_id;'); } catch (e) { }

  // Criar/ajustar tabela horarios_recorrentes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS horarios_recorrentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      dia_semana INTEGER NOT NULL,
      hora_inicio TEXT NOT NULL,
      duracao_minutos INTEGER NOT NULL,
      data_inicio_vigencia TEXT,
      data_fim_vigencia TEXT,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
    );
  `);

  // Criar/ajustar tabela aulas
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS aulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      data_aula TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      duracao_minutos INTEGER NOT NULL,
      presenca INTEGER DEFAULT 0,
      observacoes TEXT,
      tipo_aula TEXT NOT NULL,
      horario_recorrente_id INTEGER,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
      FOREIGN KEY (horario_recorrente_id) REFERENCES horarios_recorrentes(id) ON DELETE SET NULL
    );
  `);
};

// MIGRAÇÃO: Criação da tabela horarios_recorrentes se não existir
export const migrarHorariosRecorrentes = async () => {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS horarios_recorrentes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      dia_semana INTEGER NOT NULL,
      hora_inicio TEXT NOT NULL,
      duracao_minutos INTEGER NOT NULL,
      data_inicio_vigencia TEXT,
      data_fim_vigencia TEXT,
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
    );
  `);
};

/**
 * Remove todos os padrões recorrentes (horarios_recorrentes) do banco
 */
export const limparTodosHorariosRecorrentes = async () => {
  const db = await getDatabase();
  try {
    console.log('🧹 Limpando TODOS os padrões recorrentes (horarios_recorrentes)...');
    const result = await db.runAsync('DELETE FROM horarios_recorrentes;');
    console.log(`✅ Removidos ${result.changes} padrões recorrentes do banco!`);
    return result.changes;
  } catch (error) {
    console.error('❌ Erro ao limpar padrões recorrentes:', error);
    throw error;
  }
}; 