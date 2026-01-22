Título: Personal Trainer "Canivete Suíço" (Mobile Offline)
Descrição:

Este projeto é um aplicativo mobile nativo robusto, desenvolvido para auxiliar personal trainers na gestão e acompanhamento de seus alunos, otimizando o dia a dia e permitindo operação 100% offline.

Construído com React Native, TypeScript e Expo no frontend, e utilizando SQLite para armazenamento local de dados, o app foi desenhado para ser uma ferramenta de trabalho no "batidão" do personal trainer.

Funcionalidades Principais (MVP):

Gerenciamento de Alunos: Cadastro, edição e visualização de perfis de alunos.

Fichas de Treino Completas: Criação e personalização de fichas de treino com séries, repetições/tempo, carga e observações.

Histórico de Treino Detalhado: Registro e acompanhamento da evolução dos treinos de cada aluno.

Ferramentas de Tempo Integradas: Cronômetro de exercícios e contador de intervalo com alertas sonoros.

Controle de Séries: Registro rápido das séries concluídas durante o treino.

Lembretes e Notificações (Internas): Lembretes de hidratação para alunos e notificações de aulas/progresso para o personal.

Avaliação Física Simplificada: Calculadora de IMC e registro de medidas corporais.

Calendário de Aulas: Agendamento, visualização de agenda e controle de presença.

Backup e Restauração Local: Funcionalidade para criar e importar backups do banco de dados SQLite, garantindo a segurança dos dados offline.

Padronização Visual (Design System): Tema escuro consistente com paleta de cores (Amarelo/Preto), tipografia (Roboto/Source Sans Pro) e componentes reutilizáveis.

Padronização de Datas: Tratamento robusto de datas (DD-MM-AAAA) em toda interface e ISO (YYYY-MM-DD) no banco de dados.

Filosofia do Projeto:

Offline First: Funcionalidade total sem dependência de internet.

Performance: Desenvolvido para ser ágil e responsivo, mesmo com grandes volumes de dados locais.

Usabilidade: Interface intuitiva para uso rápido e eficiente em ambientes de treino.

Importante: Este aplicativo é exclusivamente mobile. Não há interface web.

Hierarquia de Dados e Fluxo:

- Aluno
    - Ficha de Treino (um aluno pode ter várias fichas)
        - Exercícios (cada ficha possui seus próprios exercícios)

Fluxo esperado no app:
1. Selecionar um aluno
2. Visualizar/Adicionar Fichas de Treino desse aluno
3. Dentro de cada ficha, visualizar/adicionar Exercícios

Cada ficha de treino deve exibir diretamente os exercícios associados, sem etapas intermediárias desnecessárias.

## Avaliação Física Completa (para pós-MVP)

Quando formos expandir a avaliação física além da versão simplificada do MVP, contemplar as seguintes etapas e testes:

- PAR-Q (Questionário de Prontidão para Atividade Física)
- Anamnese (Entrevista de Histórico de Saúde)
- Aferição de Peso e Altura
- Cálculo de IMC (Índice de Massa Corporal)
- Medidas de Circunferências Corporais (Ex: cintura, quadril, braço)
- Dobras Cutâneas (Avaliação com adipômetro para percentual de gordura)
- Bioimpedância (Análise de Composição Corporal por corrente elétrica)
- Avaliação Postural
- Testes Cardiorrespiratórios (Ex: Teste de Cooper, Teste de Esteira/Bicicleta Ergométrica para VO2 máx)
- Testes de Força Muscular (Ex: Testes de 1RM - Repetição Máxima)
- Testes de Resistência Muscular Localizada (Ex: Flexões, Abdominais)
- Testes de Flexibilidade (Ex: Sentar e Alcançar)

Esses itens servirão de base para a evolução do sistema após a entrega do MVP.

- **Refatoração Concluída:**
  - O banco de dados armazena apenas **REGRAS** (ex: "Toda Seg e Qua") e **EXCEÇÕES/HISTÓRICO** (aulas passadas, cancelamentos, aulas avulsas).
  - Não existe mais "geração de aulas futuras" no banco.
  - A visualização do calendário é calculada em tempo real (memória) mesclando as regras ativas com as exceções registradas.
  - Botão de acesso rápido a Fichas no cartão de aula.

- **Vantagens:**
  - Banco de dados leve e limpo.
  - Edição de horários instantânea e robusta.
  - Robustez contra inconsistências de dados.

- **UI/UX:**
  - Uso de `react-native-calendars` mantido.
  - Diferenciação visual clara entre aula "Virtual", "Real" e "Cancelada".
  - Tema escuro aplicado consistentemente.