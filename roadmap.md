# Roadmap de Desenvolvimento - MVP Personal Trainer Offline

## 1. Estrutura Inicial do Projeto
- [x] Configurar ambiente React Native com TypeScript e Expo
- [x] Integrar SQLite local (expo-sqlite ou sqlite puro)
- [x] Definir estrutura de navegação (React Navigation)
- [x] Escolher solução de gerenciamento de estado (Zustand)

## 2. Gerenciamento de Alunos e Fichas de Treino
- [x] Tela de listagem de alunos (nome, foto, status)
- [x] Cadastro e edição de aluno (nome, contato, objetivos, observações)
- [x] Criação e edição de ficha de treino para cada aluno
- [x] Adição de exercícios à ficha (nome, séries, repetições/tempo, carga, descanso, observações)
- [x] Copiar treinos para outros dias/alunos
- [x] Visualização da ficha de treino atual
- [x] Persistência das fichas e alunos no SQLite

## 3. Execução do Treino e Monitoramento ✅ CONCLUÍDO
- [x] Tela de treino ativo (exercício atual, séries, repetições, carga)
- [x] Botão "Série Concluída"
- [x] Registro de carga/repetições reais por série
- [x] Salvamento automático do treino no histórico
- [x] Visualização do histórico completo do aluno
- [x] Anotações rápidas durante o treino
- [x] Cronômetro integrado para exercícios de tempo
- [x] Temporizador de descanso com alerta sonoro/vibração
- [x] Resumo rápido do histórico do exercício

## 4. Lembretes e Notificações Internas 🎯 PRÓXIMA FASE
- [ ] Lembrete de hidratação (configurável por aluno, push local)
- [ ] Lembrete de aula (notificações internas para o professor)
- [ ] Notificação de progresso (alertas de marcos alcançados)

## 5. Avaliação Física Simplificada ✅ CONCLUÍDO
- [x] Tela de cálculo de IMC (salvar resultado no perfil) - CORRIGIDO
- [x] Registro de medidas (peso, altura, circunferências)
- [x] Histórico de medidas

## 6. Calendário de Aulas ✅ CONCLUÍDO
- [x] Tela de calendário com aulas agendadas
- [x] Adição, edição e exclusão de aulas (avulsas, recorrentes, sobrescritas, canceladas)
- [x] Marcação de presença do aluno (presente, falta, cancelada)
- [x] Manipulação de recorrências: sobrescrever/cancelar ocorrência individual e toda a série
- [x] Atualização imediata do calendário após qualquer operação
- [x] UX moderna e robusta para manipulação de aulas
- [x] Configuração de quantidade de meses futuros para geração de aulas recorrentes - CORRIGIDO

## 7. Backup e Restauração de Dados ✅ CONCLUÍDO
- [x] Opção de backup dos dados do SQLite (exportar arquivo .db) - CORRIGIDO
- [x] Opção de restauração/importação de backup (com aviso de perda de dados) - CORRIGIDO
- [x] Backup local, seguro e com feedback claro ao usuário. - CORRIGIDO

## 8. Robustez e Usabilidade
- [ ] Implementar testes de unidade e integração
- [ ] Foco em usabilidade para uso rápido e prático
- [ ] Refatorar estrutura de pastas/telas para separar claramente screens, componentes e domínios do app, conforme sugestão:

  ```
  app/
    screens/
      Home/
        HomeScreen.tsx
        TabsNavigator.tsx
      Alunos/
        AlunosListScreen.tsx
        AlunoDetailScreen.tsx
        EditAlunoScreen.tsx
        AvaliacaoScreen.tsx
        FichasScreen.tsx
        HorariosPadraoScreen.tsx
        ImcScreen.tsx
        NovaMedidaScreen.tsx
        HistoricoScreen.tsx
      Fichas/
        FichaDetailScreen.tsx
        VisualizarFichaScreen.tsx
        TreinoAtivoScreen.tsx
      Treinos/
        TreinoDetailScreen.tsx
      Calendario/
        CalendarioScreen.tsx
        NovaAulaScreen.tsx
        EditarAulaScreen.tsx
      Configuracoes/
        ConfiguracoesScreen.tsx
    components/
      modals/
        ExercicioModal.tsx
        FichaModal.tsx
        TreinoModal.tsx
        CopiarFichaModal.tsx
        GenericModal.tsx
    navigation/
      AppNavigator.tsx
      TabNavigator.tsx
      StackNavigators.tsx
    utils/
    store/
    assets/
  ```

  - Vantagens: organização por domínio, separação clara de telas e componentes, fácil manutenção e escalabilidade.

## Refatoração do Calendário - Novos Passos

1. **Banco de Dados**
   - [x] Criar tabela `horarios_recorrentes` no SQLite.
   - [x] Ajustar tabela `aulas` para novos campos e tipos.

2. **Lógica de Backend/Store**
   - [x] Implementar funções para buscar, criar e atualizar `horarios_recorrentes`.
   - [x] Refatorar lógica de geração de aulas recorrentes "on demand" ao abrir o calendário.
   - [x] Implementar lógica de sobrescrita e cancelamento de aulas específicas e de toda a recorrência.

3. **Interface do Usuário**
   - [x] Integrar `react-native-calendars` para visualização mensal.
   - [x] Marcar dias com aulas, diferenciando tipos e status.
   - [x] Listar aulas do dia ao clicar em uma data.
   - [x] Adicionar/editar/desativar horários padrão no perfil do aluno.
   - [x] Permitir edição/cancelamento de aulas individuais e adição de aulas avulsas.
   - [x] Modal de presença direto no calendário.

4. **Testes e Ajustes**
   - [x] Testar geração de aulas em diferentes cenários (recorrente, avulsa, sobrescrita, cancelada).
   - [x] Ajustar UX conforme feedback.

---

> **Observações:**
> - Todas as funcionalidades principais devem operar offline.
> - O app será focado exclusivamente em dispositivos móveis.
> - Priorizar performance, confiabilidade e experiência do usuário.
> - O desenvolvimento dos lembretes da seção 4 ficará para depois. 
> - O calendário agora reflete imediatamente todas as operações de manipulação de aulas, recorrências e presença, com feedback claro ao usuário.
> - O backup é local, seguro e pode ser compartilhado/exportado facilmente. 