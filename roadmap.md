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

## 5. Avaliação Física Simplificada
- [x] Tela de cálculo de IMC (salvar resultado no perfil)
- [x] Registro de medidas (peso, altura, circunferências)
- [x] Histórico de medidas

## 6. Calendário de Aulas
- [ ] Tela de calendário com aulas agendadas
- [ ] Adição, edição e exclusão de aulas
- [ ] Marcação de presença do aluno

## 7. Backup e Restauração de Dados
- [ ] Opção de backup dos dados do SQLite (exportar arquivo)
- [ ] Opção de restauração/importação de backup (com aviso de perda de dados)

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
   - [ ] Criar tabela `horarios_recorrentes` no SQLite.
   - [ ] Ajustar tabela `aulas` para novos campos e tipos.

2. **Lógica de Backend/Store**
   - [ ] Implementar funções para buscar, criar e atualizar `horarios_recorrentes`.
   - [ ] Refatorar lógica de geração de aulas recorrentes "on demand" ao abrir o calendário.
   - [ ] Implementar lógica de sobreescrita e cancelamento de aulas específicas.

3. **Interface do Usuário**
   - [ ] Integrar `react-native-calendars` para visualização mensal.
   - [ ] Marcar dias com aulas, diferenciando tipos e status.
   - [ ] Listar aulas do dia ao clicar em uma data.
   - [ ] Adicionar/editar/desativar horários padrão no perfil do aluno.
   - [ ] Permitir edição/cancelamento de aulas individuais e adição de aulas avulsas.

4. **Testes e Ajustes**
   - [ ] Testar geração de aulas em diferentes cenários (recorrente, avulsa, sobreescrita, cancelada).
   - [ ] Ajustar UX conforme feedback.

---

> **Observações:**
> - Todas as funcionalidades principais devem operar offline.
> - O app será focado exclusivamente em dispositivos móveis.
> - Priorizar performance, confiabilidade e experiência do usuário.
> - O desenvolvimento dos lembretes da seção 4 ficará para depois. 

## Lógica de Recorrência de Aulas no Calendário

- Ao cadastrar uma aula recorrente, o sistema salva apenas a configuração da recorrência (aluno, hora, duração, dias da semana, data de início).
- Não são criadas todas as aulas futuras no banco imediatamente.
- Quando o usuário navega para um mês no calendário, o sistema calcula e exibe as datas das aulas recorrentes daquele mês, a partir da configuração salva.
- Se o professor editar ou cancelar uma dessas aulas, a exceção é salva no banco.
- O campo "Data" no cadastro de aula recorrente é desabilitado e substituído por "A partir de qual data?" para definir o início da recorrência.
- Isso evita poluir o banco com aulas futuras desnecessárias e mantém o calendário sempre atualizado com as recorrências do mês em foco. 