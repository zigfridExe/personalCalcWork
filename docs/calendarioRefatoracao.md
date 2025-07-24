# Refatoração do Calendário

## Objetivo

Unificar e simplificar a lógica de aulas recorrentes, avulsas e exceções, centralizando tudo na tabela `aulas` e removendo tabelas/colunas e funções legadas. Garantir que todas as telas do app continuem funcionando e documentar o novo fluxo.

---

## 1. Estrutura do Banco de Dados

### Tabela `horarios_recorrentes`
Define padrões de recorrência para cada aluno.

```sql
CREATE TABLE IF NOT EXISTS horarios_recorrentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL, -- 0=Domingo, ..., 6=Sábado
    hora_inicio TEXT NOT NULL,   -- 'HH:MM'
    duracao_minutos INTEGER NOT NULL,
    data_inicio_vigencia TEXT,
    data_fim_vigencia TEXT,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);
```

### Tabela `aulas`
Contém todas as instâncias de aulas (recorrentes, avulsas, exceções).

```sql
CREATE TABLE IF NOT EXISTS aulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    data_aula TEXT NOT NULL,     -- 'YYYY-MM-DD'
    hora_inicio TEXT NOT NULL,   -- 'HH:MM'
    duracao_minutos INTEGER NOT NULL,
    presenca INTEGER DEFAULT 0,  -- 0=Agendada, 1=Presente, 2=Faltou, 3=Cancelada
    observacoes TEXT,
    tipo_aula TEXT NOT NULL,     -- 'RECORRENTE_GERADA', 'AVULSA', 'EXCECAO_HORARIO', 'EXCECAO_CANCELAMENTO'
    horario_recorrente_id INTEGER,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (horario_recorrente_id) REFERENCES horarios_recorrentes(id) ON DELETE SET NULL
);
```

**Remover:** `presencas_recorrentes`, `rrule`, `data_avulsa`, `sobrescrita_id`, `cancelada_por_id`.

---

## 2. Fluxo de Geração de Aulas Recorrentes

- Ao iniciar o app ou navegar para um mês, gere aulas do tipo `RECORRENTE_GERADA` para o período desejado.
- Para cada padrão em `horarios_recorrentes`, gere datas e insira na tabela `aulas` **apenas se não houver exceção/avulsa para aquele dia**.

---

## 3. Marcação de Presença

- Marcar presença = atualizar o campo `presenca` da aula correspondente na tabela `aulas`.

---

## 4. Exceções e Cancelamentos

- Para mudar/cancelar uma aula recorrente em um dia específico, insira/atualize um registro em `aulas` com tipo `EXCECAO_HORARIO` ou `EXCECAO_CANCELAMENTO`.

---

## 5. Exibição no Calendário

- Sempre consulte apenas a tabela `aulas` para exibir as aulas do dia/mês.
- O status de presença e o tipo de aula vêm diretamente dos campos da tabela.

---

## 6. Integração com Outras Telas

- **Tela de Aluno:** Consulta aulas por aluno normalmente.
- **Histórico:** Usa apenas a tabela `aulas`.
- **Ficha/Treino:** Sem impacto, pois não depende de recorrência.
- **Configurações:** Pode permitir ajuste do período de look-ahead.

---

## 7. Pontos de Atenção

- Garantir que a geração de aulas recorrentes não crie duplicatas.
- Testar todos os fluxos: criação, edição, presença, exceção, cancelamento.
- Validar integração com backup/restauração.

---

## 8. Scripts de Migração

- [ ] Script para remover colunas/tabelas legadas.
- [ ] Script para criar novas tabelas/colunas.
- [ ] Script para migrar dados antigos, se necessário.

---

## 9. TODOs

- [ ] Refatorar stores e utils para nova lógica.
- [ ] Refatorar telas para consultar só a tabela `aulas`.
- [ ] Testar todos os fluxos.
- [ ] Atualizar esta documentação conforme avançar.

---

> **Mantenha este arquivo atualizado durante toda a refatoração!** 