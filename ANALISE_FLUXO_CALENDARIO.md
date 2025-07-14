# ANÁLISE COMPLETA DO FLUXO DO CALENDÁRIO

## 1. ESTRUTURA DO BANCO DE DADOS

### Tabela `horarios_recorrentes`
```sql
CREATE TABLE horarios_recorrentes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL,
  dia_semana INTEGER NOT NULL,  -- 0=Domingo, 1=Segunda, ..., 6=Sábado
  hora_inicio TEXT NOT NULL,    -- formato "HH:MM"
  duracao_minutos INTEGER NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  data_inicio_vigencia TEXT,    -- formato "YYYY-MM-DD"
  data_fim_vigencia TEXT,       -- formato "YYYY-MM-DD"
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);
```

### Tabela `aulas`
```sql
CREATE TABLE aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER,
  data_aula TEXT,               -- formato "YYYY-MM-DD"
  hora_inicio TEXT,             -- formato "HH:MM"
  duracao_minutos INTEGER,
  presenca INTEGER DEFAULT 0,   -- 0=Agendada, 1=Presente, 2=Faltou, 3=Cancelada
  tipo_aula TEXT,               -- 'RECORRENTE', 'AVULSA', 'SOBREESCRITA', 'CANCELADA_RECORRENTE'
  horario_recorrente_id INTEGER, -- FK para horarios_recorrentes
  observacoes TEXT,
  FOREIGN KEY (aluno_id) REFERENCES alunos (id) ON DELETE CASCADE
);
```

## 2. FLUXO COMPLETO

### 2.1. Criação de Horários Padrão
**Arquivo:** `app/aluno/[id]/horarios-padrao.tsx`

1. **Interface:** Usuário seleciona dia da semana (0-6), hora, duração
2. **Validação:** Formato HH:MM, datas válidas
3. **Salvamento:** Chama `addHorario()` da store `useHorariosRecorrentesStore`
4. **Banco:** Insere na tabela `horarios_recorrentes`

### 2.2. Geração de Aulas Recorrentes
**Arquivo:** `utils/recorrenciaUtils.ts`

**Função:** `gerarAulasRecorrentesParaPeriodo(periodoInicio, periodoFim, aluno_id)`

1. **Busca horários:** `buscarHorariosRecorrentes(aluno_id)`
2. **Para cada horário:**
   - Chama `getAllWeekdaysInRange(periodoInicio, periodoFim, horario.dia_semana)`
   - **PROBLEMA POTENCIAL:** Esta função pode estar gerando datas erradas

### 2.3. Função `getAllWeekdaysInRange`
```typescript
function getAllWeekdaysInRange(start: string, end: string, weekday: number): string[] {
  const dates: string[] = [];
  let current = new Date(start);
  const endDate = new Date(end);

  // Ajusta para o primeiro dia da semana desejado
  while (current.getDay() !== weekday) {
    current.setDate(current.getDate() + 1);
  }

  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}
```

**ANÁLISE DA FUNÇÃO:**
- ✅ Ajusta a data inicial para o dia da semana correto
- ✅ Incrementa de 7 em 7 dias
- ✅ Retorna formato YYYY-MM-DD

### 2.4. Carregamento no Calendário
**Arquivo:** `app/calendario/index.tsx`

1. **Chama:** `carregarAulas(inicio, fim)` da store `useAulasStore`
2. **Store:** `store/useAulasStore.ts`
   - Chama `gerarAulasRecorrentesParaPeriodo()` ANTES de buscar
   - Busca aulas do banco com JOIN em alunos
   - Atualiza estado

## 3. POSSÍVEIS PROBLEMAS IDENTIFICADOS

### 3.1. Problema de Timezone
- `new Date(start)` pode ser afetado por timezone
- `toISOString().slice(0, 10)` pode retornar data diferente

### 3.2. Problema de Dia da Semana
- JavaScript: `getDay()` retorna 0=Domingo, 1=Segunda, etc.
- Banco: `dia_semana` também usa 0=Domingo, 1=Segunda, etc.
- **CONFIRMADO:** Ambos usam o mesmo padrão

### 3.3. Problema de Período Inicial
- Se `periodoInicio` não for o primeiro dia do mês, pode gerar datas fora do período esperado

### 3.4. Problema de Duplicação
- Aulas podem ser geradas múltiplas vezes
- Verificação de existência pode falhar

## 4. TESTE SUGERIDO

1. **Criar aluno**
2. **Criar horário padrão:** Segunda-feira, 08:00
3. **Verificar banco:** `SELECT * FROM horarios_recorrentes WHERE aluno_id = X`
4. **Carregar calendário:** Verificar logs de `gerarAulasRecorrentesParaPeriodo`
5. **Verificar aulas geradas:** `SELECT * FROM aulas WHERE aluno_id = X ORDER BY data_aula`

## 5. LOGS IMPORTANTES PARA VERIFICAR

### 5.1. Na criação do horário padrão:
```
[RECORRENCIA] Processando horário: Aluno X, Dia 1 (Seg), Hora 08:00
```

### 5.2. Na geração de aulas:
```
[RECORRENCIA] ✅ MATCH: 2025-01-13 (Seg) = Horário Seg
[RECORRENCIA] 💾 SALVANDO: 2025-01-13 08:00 - Aluno X
[RECORRENCIA] ✅ SALVA: Aula criada com sucesso
```

### 5.3. No carregamento do calendário:
```
[AULAS] 🔍 Carregando aulas: 2025-01-01 até 2025-01-31
[AULAS] 📊 Encontradas X aulas no banco
[AULAS] 📅 Aula 1: 2025-01-13 08:00 - João (RECORRENTE)
```

## 6. PRÓXIMOS PASSOS

1. **Testar com banco limpo**
2. **Criar horário padrão simples**
3. **Verificar logs detalhados**
4. **Confirmar se as datas geradas estão corretas**
5. **Verificar se o problema está na geração ou na exibição** 