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