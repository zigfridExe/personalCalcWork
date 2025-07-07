# Roadmap de Desenvolvimento - MVP Personal Trainer Offline

## 1. Estrutura Inicial do Projeto
- [ ] Configurar ambiente React Native com TypeScript e Expo
- [x] Integrar SQLite local (expo-sqlite ou sqlite puro)
- [x] Definir estrutura de navegação (React Navigation)
- [ ] Escolher solução de gerenciamento de estado (Context API, Redux Toolkit, Zustand, etc.)

## 2. Gerenciamento de Alunos e Fichas de Treino
- [ ] Tela de listagem de alunos (nome, foto, status)
- [ ] Cadastro e edição de aluno (nome, contato, objetivos, observações)
- [ ] Criação e edição de ficha de treino para cada aluno
- [ ] Adição de exercícios à ficha (nome, séries, repetições/tempo, carga, descanso, observações)
- [ ] Copiar treinos para outros dias/alunos
- [ ] Visualização da ficha de treino atual
- [ ] Persistência das fichas e alunos no SQLite

## 3. Execução do Treino e Monitoramento
- [ ] Tela de treino ativo (exercício atual, séries, repetições, carga)
- [ ] Botão "Série Concluída"
- [ ] Registro de carga/repetições reais por série
- [ ] Anotações rápidas durante o treino
- [ ] Cronômetro integrado para exercícios de tempo
- [ ] Temporizador de descanso com alerta sonoro/vibração
- [ ] Resumo rápido do histórico do exercício
- [ ] Salvamento automático do treino no histórico
- [ ] Visualização do histórico completo do aluno

## 4. Lembretes e Notificações Internas
- [ ] Lembrete de hidratação (configurável por aluno, push local)
- [ ] Lembrete de aula (notificações internas para o professor)
- [ ] Notificação de progresso (alertas de marcos alcançados)

## 5. Avaliação Física Simplificada
- [ ] Tela de cálculo de IMC (salvar resultado no perfil)
- [ ] Registro de medidas (peso, altura, circunferências)
- [ ] Histórico de medidas

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

---

> **Observações:**
> - Todas as funcionalidades principais devem operar offline.
> - O app será focado exclusivamente em dispositivos móveis.
> - Priorizar performance, confiabilidade e experiência do usuário. 