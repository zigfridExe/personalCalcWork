Análise das Anotações
1. Cadastro/Edição de Aluno
Problema: Telas de cadastro e edição de aluno têm campos diferentes.
Solução MVP: Unificar os campos essenciais nas duas telas (pelo menos Nome, Telefone, Idade/Data de Nascimento, Foto).
Refatoração futura: Criar um único componente de formulário de aluno, usado tanto para criar quanto para editar.
2. Gerenciamento de Aula
Problema: Gerenciamento de aula está na edição de aluno, mas deveria estar no calendário.
Solução MVP: Remover (ou ocultar) o gerenciamento de aula da tela de edição de aluno, deixando esse fluxo apenas no calendário.
Refatoração futura: Garantir que toda lógica de aula fique centralizada no domínio "Calendário/Aulas".
3. Configurações e Banco de Dados
Problema: Funções de debug e manutenção do banco estão misturadas e algumas não funcionam.
Solução MVP: Garantir que as funções críticas (limpar aulas duplicadas, limpar aulas, regenerar aulas recorrentes) funcionem, mesmo que de forma simples.
Refatoração futura: Criar uma tela de administração/diagnóstico separada, com logs claros e funções robustas.
4. Criação de Aula
Problema: Processo de criação de aula precisa ser mais robusto e intuitivo.
Solução MVP: Ao clicar em "Nova Aula" no calendário, abrir um fluxo claro: escolher aluno, tipo de aula (avulsa/recorrente), dias/horários, observações.
Refatoração futura: Implementar um wizard/componentes reutilizáveis para criação de aulas, com validações e feedbacks.
5. Ficha de Treino
Problema: Campos de datas e horários precisam ser normalizados.
Solução MVP: Garantir que datas e horários estejam no mesmo formato em todas as telas e no banco.
Refatoração futura: Centralizar a lógica de formatação de datas/horários em utilitários.
Plano de Ação Resumido
Para o MVP (Curto Prazo)
Unificar campos essenciais entre cadastro e edição de aluno.
Remover/ocultar gerenciamento de aula da edição de aluno.
Testar e corrigir funções críticas de manutenção do banco (limpeza, regeneração).
Simplificar o fluxo de criação de aula no calendário, garantindo clareza e funcionamento.
Normalizar datas/horários nas fichas de treino e aulas.
Documentar no código e em um doc rápido as soluções temporárias e limitações.
Para a Refatoração (Pós-MVP)
Criar componentes reutilizáveis para formulários de aluno e aula.
Centralizar lógica de aulas no domínio calendário.
Separar tela de administração/diagnóstico para funções de banco.
Implementar wizard/componentes para criação de aulas.
Padronizar manipulação de datas/horários em utilitários.
Reorganizar pastas e domínios conforme sugerido no roadmap.
Sugestão de Documentação para MVP
> Limitações conhecidas (MVP):
> - Telas de cadastro e edição de aluno ainda possuem pequenas diferenças de campos.
> - Algumas funções de manutenção do banco são provisórias e serão aprimoradas.
> - O gerenciamento de aulas está centralizado no calendário, mas pode haver resíduos em outras telas.
> - O fluxo de criação de aula será simplificado para a apresentação, mas será refeito na próxima versão.
> - Datas e horários estão sendo normalizados, mas podem haver inconsistências pontuais.
Próximos Passos
Você quer que eu te ajude a criar um checklist de tarefas para o MVP com base nesses pontos?
Ou prefere que eu te ajude a documentar as limitações e soluções temporárias para apresentar aos stakeholders?
Se quiser, posso sugerir como organizar o código/comentários para facilitar a futura refatoração.
Me diga qual dessas opções (ou todas) você prefere, e seguimos juntos!