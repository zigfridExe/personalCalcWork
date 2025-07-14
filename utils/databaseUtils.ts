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
          data TEXT,
          hora TEXT,
          descricao TEXT,
          presenca INTEGER DEFAULT 0,
          FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
        );
      `);
      console.log('Tabela aulas criada com sucesso.');
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
    await db.execAsync('DROP TABLE IF EXISTS horarios_recorrentes;');
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
        tipo_aula TEXT,
        horario_recorrente_id INTEGER,
        observacoes TEXT,
        FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
      );

      CREATE TABLE horarios_recorrentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER NOT NULL,
        dia_semana INTEGER NOT NULL,
        hora_inicio TEXT NOT NULL,
        duracao_minutos INTEGER NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1,
        data_inicio_vigencia TEXT,
        data_fim_vigencia TEXT,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
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

      // Migração: adicionar tabela horarios_recorrentes se não existir
      try {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS horarios_recorrentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aluno_id INTEGER NOT NULL,
            dia_semana INTEGER NOT NULL,
            hora_inicio TEXT NOT NULL,
            duracao_minutos INTEGER NOT NULL,
            ativo INTEGER NOT NULL DEFAULT 1,
            data_inicio_vigencia TEXT,
            data_fim_vigencia TEXT,
            FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
          );
        `);
        console.log('Tabela horarios_recorrentes criada/verificada com sucesso.');
      } catch (error) {
        console.error('Erro ao criar/verificar tabela horarios_recorrentes:', error);
      }

      // Migração: ajustar tabela aulas para novo modelo
      // Adicionar colunas se não existirem
      const aulasColumns = await db.getAllAsync("PRAGMA table_info(aulas);");
      const colunasNecessarias = [
        { nome: 'data_aula', tipo: 'TEXT' },
        { nome: 'hora_inicio', tipo: 'TEXT' },
        { nome: 'duracao_minutos', tipo: 'INTEGER' },
        { nome: 'tipo_aula', tipo: 'TEXT' },
        { nome: 'horario_recorrente_id', tipo: 'INTEGER' },
        { nome: 'observacoes', tipo: 'TEXT' }
      ];
      for (const coluna of colunasNecessarias) {
        if (!aulasColumns.some((col: any) => col.name === coluna.nome)) {
          try {
            await db.execAsync(`ALTER TABLE aulas ADD COLUMN ${coluna.nome} ${coluna.tipo};`);
            console.log(`Coluna ${coluna.nome} adicionada à tabela aulas.`);
          } catch (error) {
            console.log(`Erro ao adicionar coluna ${coluna.nome} (pode já existir):`, error);
          }
        }
      }

      // MIGRAÇÃO: Adiciona a coluna data_nascimento se não existir
      await db.execAsync(`
        PRAGMA foreign_keys=off;
        BEGIN TRANSACTION;
        CREATE TABLE IF NOT EXISTS temp_alunos_migracao AS SELECT * FROM alunos;
        ALTER TABLE alunos ADD COLUMN data_nascimento TEXT;
        COMMIT;
        PRAGMA foreign_keys=on;
      `).catch(() => {}); // Ignora erro se a coluna já existir
    });
    
    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}; 

// Funções utilitárias para horarios_recorrentes

/**
 * Insere um novo horário recorrente para um aluno.
 */
export const inserirHorarioRecorrente = async (horario: {
  aluno_id: number;
  dia_semana: number;
  hora_inicio: string;
  duracao_minutos: number;
  ativo?: number;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
}) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO horarios_recorrentes (aluno_id, dia_semana, hora_inicio, duracao_minutos, ativo, data_inicio_vigencia, data_fim_vigencia)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      horario.aluno_id,
      horario.dia_semana,
      horario.hora_inicio,
      horario.duracao_minutos,
      horario.ativo ?? 1,
      horario.data_inicio_vigencia ?? null,
      horario.data_fim_vigencia ?? null
    ]
  );
};

/**
 * Busca todos os horários recorrentes ativos (ou de um aluno específico, se informado).
 */
export const buscarHorariosRecorrentes = async (aluno_id?: number) => {
  const db = await getDatabase();
  let query = 'SELECT * FROM horarios_recorrentes WHERE ativo = 1';
  let params: any[] = [];
  if (aluno_id !== undefined) {
    query += ' AND aluno_id = ?';
    params.push(aluno_id);
  }
  return await db.getAllAsync(query, params);
};

/**
 * Atualiza um horário recorrente pelo id.
 */
export const atualizarHorarioRecorrente = async (id: number, dados: Partial<{
  dia_semana: number;
  hora_inicio: string;
  duracao_minutos: number;
  ativo: number;
  data_inicio_vigencia: string | null;
  data_fim_vigencia: string | null;
}>) => {
  const db = await getDatabase();
  const campos = Object.keys(dados).map(k => `${k} = ?`).join(', ');
  const valores = Object.values(dados);
  if (!campos) return;
  await db.runAsync(
    `UPDATE horarios_recorrentes SET ${campos} WHERE id = ?;`,
    [...valores, id]
  );
};

/**
 * Desativa (soft delete) um horário recorrente.
 */
export const desativarHorarioRecorrente = async (id: number) => {
  await atualizarHorarioRecorrente(id, { ativo: 0 });
};

/**
 * Remove aulas duplicadas do banco de dados, mantendo apenas uma por aluno/data/hora/horario_recorrente_id.
 */
export const limparAulasDuplicadas = async () => {
  const db = await getDatabase();
  try {
    console.log('🧹 LIMPEZA URGENTE: Removendo TODAS as aulas recorrentes...');
    
    // REMOÇÃO COMPLETA - mais seguro neste momento
    const result = await db.runAsync('DELETE FROM aulas WHERE tipo_aula = \'RECORRENTE\';');
    console.log(`🧹 Removidas ${result.changes} aulas recorrentes do banco!`);
    
    console.log('✅ Limpeza completa concluída!');
  } catch (error) {
    console.error('❌ Erro ao limpar aulas:', error);
    throw error;
  }
};

/**
 * Limpa TODAS as aulas recorrentes do banco (função de emergência)
 */
export const limparTodasAulasRecorrentes = async () => {
  try {
    console.log('🚨 LIMPEZA DE EMERGÊNCIA: Iniciando...');
    
    // 1. Reiniciar conexão primeiro
    console.log('🔄 Reiniciando conexão com banco...');
    await reiniciarConexaoBanco();
    
    // 2. Testar banco
    console.log('🔧 Testando banco...');
    const bancoOK = await testarBanco();
    if (!bancoOK) {
      throw new Error('Banco de dados não está funcionando');
    }
    
    // 3. Obter nova instância
    console.log('📡 Obtendo nova instância do banco...');
    const db = await getDatabase();
    
    // 4. Executar limpeza
    console.log('🧹 Executando limpeza...');
    const result = await db.runAsync('DELETE FROM aulas WHERE tipo_aula = \'RECORRENTE\';');
    
    console.log(`✅ Removidas ${result.changes} aulas recorrentes!`);
    return result.changes;
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
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
    
    // Listar horários recorrentes
    console.log('\n--- HORÁRIOS RECORRENTES ---');
    const horarios = await db.getAllAsync<any>('SELECT * FROM horarios_recorrentes WHERE ativo = 1 ORDER BY aluno_id, dia_semana;');
    console.log(`Total de horários recorrentes: ${horarios.length}`);
    horarios.forEach((horario: any) => {
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      console.log(`ID: ${horario.id} | Aluno: ${horario.aluno_id} | Dia: ${diasSemana[horario.dia_semana]} (${horario.dia_semana}) | Hora: ${horario.hora_inicio} | Duração: ${horario.duracao_minutos}min`);
    });
    
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
        console.log(`  • ID: ${aula.id} | Aluno: ${aula.aluno_nome || aula.aluno_id} | Hora: ${aula.hora_inicio} | Tipo: ${aula.tipo_aula} | Horário Recorrente ID: ${aula.horario_recorrente_id}`);
      });
    });
    
    // Verificar duplicações
    console.log('\n--- VERIFICAÇÃO DE DUPLICAÇÕES ---');
    const duplicadas = await db.getAllAsync<any>(`
      SELECT aluno_id, data_aula, hora_inicio, horario_recorrente_id, COUNT(*) as count
      FROM aulas 
      WHERE tipo_aula = 'RECORRENTE'
      GROUP BY aluno_id, data_aula, hora_inicio, horario_recorrente_id
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
    const aulasRemovidas = await db.runAsync('DELETE FROM aulas WHERE tipo_aula = \'RECORRENTE\';');
    console.log(`Removidas ${aulasRemovidas.changes} aulas recorrentes antigas`);
    
    // 2. Buscar horários recorrentes ativos
    const horarios = await buscarHorariosRecorrentes();
    console.log(`Encontrados ${horarios.length} horários recorrentes ativos`);
    
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
  
  // Verificar horários recorrentes
  const horarios = await buscarHorariosRecorrentes(aluno_id) as Array<{
    id: number;
    aluno_id: number;
    dia_semana: number;
    hora_inicio: string;
    duracao_minutos: number;
    ativo: number;
  }>;
  console.log(`📅 Horários recorrentes encontrados: ${horarios.length}`);
  horarios.forEach((h, i) => {
    console.log(`  ${i + 1}. Aluno ${h.aluno_id} - ${['Dom','Seg','Ter','Qua','Qui','Sex','Sab'][h.dia_semana]} ${h.hora_inicio} (${h.duracao_minutos}min)`);
  });
  
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
    const diaSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'][data.getDay()];
    console.log(`  ${i + 1}. ${aula.data_aula} (${diaSemana}) ${aula.hora_inicio} - ${aula.aluno_nome} (${aula.tipo_aula})`);
  });
  
  console.log('=== FIM DA VERIFICAÇÃO ===\n');
  
  return { horarios, aulas };
} 