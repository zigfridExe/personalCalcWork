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