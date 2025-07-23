# Levantamento de Migração Estrutural

## Telas encontradas em `app/aluno/[id]`
- avaliacao.tsx
- fichas.tsx
- horarios-padrao.tsx
- horarios.tsx
- imc.tsx
- nova-medida.tsx

## Telas já migradas para `src/domains/aluno/screens`
- AvaliacaoScreen.tsx
- FichasScreen.tsx
- HorariosPadraoScreen.tsx
- HorariosScreen.tsx
- ImcScreen.tsx
- NovaMedidaScreen.tsx

**Situação:**
As telas de aluno já foram migradas para a nova estrutura, apenas com nomes padronizados (`NomeScreen.tsx`). Os arquivos antigos ainda existem em `app/aluno/[id]` e podem ser removidos após ajuste total das rotas/imports.

---

## Telas em `app/calendario/`
- editar.tsx
- index.tsx
- nova-recorrente.tsx
- nova.tsx

## Telas em `src/domains/calendario/screens`
- (Nenhuma migrada ainda, apenas `.keep`)

---

## Resumo do status
- **Aluno:** Migração completa para `src/domains/aluno/screens` (falta só limpar os antigos e garantir imports/rotas).
- **Calendário:** Telas ainda não migradas, permanecem em `app/calendario/`.

## Próximos passos sugeridos
1. Migrar as telas de calendário para `src/domains/calendario/screens` (renomeando para o padrão `NomeScreen.tsx`).
2. Validar se há telas em outros domínios (ex: treino-ativo, historico, etc) para migrar.
3. Só depois ajustar imports/rotas e remover arquivos antigos.
