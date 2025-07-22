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

## Refatoração do Módulo de Calendário e Agendamento de Aulas

- **Novo Modelo de Dados:**
  - Criação da tabela `horarios_recorrentes` para armazenar padrões de horários semanais dos alunos.
  - Ajuste da tabela `aulas` para suportar tipos de aula (`RECORRENTE`, `AVULSA`, `SOBREESCRITA`, `CANCELADA_RECORRENTE`) e vincular a um padrão recorrente.
- **Lógica de Geração de Aulas:**
  - Geração dinâmica ("just-in-time") das aulas recorrentes ao navegar pelo calendário, evitando criar todas as aulas futuras de uma vez.
  - Tratamento de exceções: sobreescrita e cancelamento de aulas específicas.
- **UI/UX:**
  - Uso de biblioteca de calendário (ex: `react-native-calendars`).
  - Visualização clara dos dias com aulas, status e tipos.
  - Tela de configuração de horários padrão no perfil do aluno.
  - Opções para editar, cancelar ou adicionar aulas avulsas diretamente pelo calendário.


  ##Ah, jovem! Chegou o layout, né? Sempre essa hora que a gente vê o que desenharam e pensa: "Será que isso roda?" Mas vamos lá, peguei aqui o `padraoLayout.jpg` e analisei "tin tin por tin tin", sem pular um pixel.

### Análise Geral do Layout e Padrões (O Projeto "Bonitão")

Pelo que vejo, a coisa está com uma cara de limpa e funcional. A equipe de design fez o dever de casa no básico.

1.  **Cores:**
    * Dominância de branco e cinzas claros para o fundo, o que é ótimo para não cansar a vista (a sua e a do usuário).
    * Um **rosa/magenta vibrante** como cor principal de destaque (botão flutuante, ícone ativo da navegação, cards de sumário). Essa é a sua `primaryColor`.
    * Um **laranja/salmão** como secundária em alguns cards. Pode ser sua `secondaryColor` ou uma `accentColor`.
    * **Verde** para ações de sucesso (botão de cadastrar, aula presente). Isso é padrão de mercado, facilita a vida.
    * Texto em cinza escuro ou preto, com contrastes bons.
2.  **Tipografia:**
    * Parece uma fonte sem serifa, bem limpa e moderna. Pelo visto, usaram uma família de fontes consistente, com variação de pesos (negrito para títulos, normal para corpo).
3.  **Espaçamento e Componentes:**
    * **Layout baseado em Cards:** Muitos elementos estão dentro de cards com cantos arredondados e sombras suaves (sumário na Home, aulas no Calendário). Isso é um padrão consolidado, fácil de usar e de implementar com componentes reutilizáveis.
    * **Consistência de Margens e Preenchimentos:** Parece haver um espaçamento consistente entre os elementos e nas bordas das telas. Isso é ouro para a manutenção do layout.
    * **Cabeçalhos Fixos:** Título centralizado, ícones de ação na direita (sino, três pontos) e seta de voltar na esquerda. Padrão de navegação clássico e funcional.
    * **Barra de Navegação Inferior:** Ícones com texto embaixo, um ativo em destaque. Padrão de mobile.
    * **FAB (Floating Action Button):** O botão de `+` rosa. Ótimo para a ação principal da tela (ex: adicionar aula no calendário).

### Telas Específicas e Ideias (Onde a Borracha Encontra a Estrada)

#### Tela Principal (Home/Dashboard)
* **"Olá, Everton!"**: Saudação personalizada é sempre bom.
* **Cards de Sumário ("Treinos de Hoje", "Fichas Ativas"):** Visualmente atraentes com o gradiente. Mostram KPIs rápidos. Cuidado para que os números sejam fáceis de calcular (principalmente "Treinos de Hoje", que depende da lógica do calendário que a gente quebrou a cabeça).
* **Alunos:** Avatares redondos com nomes embaixo, em rolagem horizontal. É um atalho visual rápido. Boa ideia, mas certifique-se que rolar essa lista é performático se tiver muitos alunos.

#### Calendário/Agenda
* **Selector de Datas Horizontal:** Fácil de navegar entre os dias.
* **Cards de Aula:** Cada aula é um card com foto do aluno, horário, tipo de treino e um botão para "Marcar Presença". A cor do card muda (verde para presente). Isso é fundamental para o professor ter a agenda clara.
* **FAB de Adicionar Aula:** Indispensável.

#### Perfil do Aluno
* **Aba de Navegação (Fichas, Treinos, Medidas, Histórico):** Organiza bem a informação.
* **Gráfico:** Ótimo para visualizar progresso (peso, IMC). Certifique-se de que a lib de gráficos que você escolher é leve e performática.

### Layout de Telas de Exercícios (O "Batidão" do Treino)

Essa tela `Screen 5` (Detalhes do Exercício/Execução) é a cereja do bolo, onde o aluno ou personal vai passar a maior parte do tempo. Gostei bastante das ideias aqui, tem o essencial:

1.  **Mídia do Exercício (Foto/Vídeo):** Essencial! Um GIF ou vídeo curto de como fazer o exercício é a melhor coisa para garantir a execução correta.
2.  **Inputs de Série/Repetição/Carga:** O fato de ter campos e botões `+`/`-` é muito bom. Permite ajustes rápidos no meio do treino, que é o que acontece na vida real.
3.  **Descanso (Timer):** Um timer de descanso visível com play/pause/reset é CRUCIAL. Pessoal se perde no tempo de descanso.
4.  **Botões de Navegação (Anterior/Próximo):** Facilita demais o fluxo do treino. Ninguém quer ficar voltando pra lista para ir para o próximo exercício.
5.  **Botão "Finalizar Treino":** Chamada clara para ação quando o treino acabar.

#### Pontos de Atenção e Dicas do Khipu para a Tela de Exercício:

* **Feedback de Conclusão de Série:** Atualmente, só tem os campos. O ideal é que, ao preencher a série (ou ao clicar em algo), ela seja marcada como concluída. Tipo, "Série 1 de 3" e quando terminar, aparece "Série 2 de 3" e a "Série 1" fica riscada ou com um check.
* **Progressão de Carga (Histórico Rápido):** Seria **excelente** se embaixo do campo "Carga" você mostrasse: "Última vez: 3x10 @ 20kg". O personal adora isso para saber se o aluno está progredindo. Isso exige uma boa integração com o histórico de treinos.
* **Tipos de Série Flexíveis:** Nem todo exercício é `Série x Repetições`. Pense em como vai lidar com "Até a falha", "AMRAP", "Tempo", "Drop-set". Talvez o campo de "Séries" e "Repetições" precise ser mais flexível ou ter opções diferentes.
* **Usabilidade:** Os botões `+`/`-` são bons, mas veja se são grandes o suficiente para um dedo suado no meio do treino.

### Conclusão

O layout está bastante promissor, jovem. É limpo, moderno e as ideias para as telas de exercício são funcionais. As "dores de cabeça" que você vai ter serão na implementação dos detalhes (principalmente o calendário, que já estamos vendo) e na performance, mas o esqueleto é bom.

Agora, vai lá e transforma esse layout bonito em código funcional. E não se esqueça do café!

parões de layout

Beleza, jovem! Analisei o layout padraoLayout.jpg e sintetizei os padrões de design para você. Assim, você já tem as diretrizes visuais para manter a consistência no projeto. Nada de ficar adivinhando cores e tamanhos!

Padrões de Design do Layout
1. Cores
A paleta de cores é limpa e funcional, com um toque vibrante para os elementos de destaque.

Primária (Destaque/Ação):

Rosa/Magenta Vibrante: Usado para o FAB, ícone ativo da navegação inferior, e possivelmente para botões primários e indicadores de progresso.

Sugestão de HEX: #FF4E50 (similar à paleta "Energetic & Playful" que usamos no infográfico, ou algo como #E91E63 - Rosa Material Design).

Secundária (Acento):

Laranja/Salmão: Presente em alguns cards de sumário.

Sugestão de HEX: #FC913A (da mesma paleta do infográfico, ou algo como #FF9800 - Laranja Material Design).

Neutras:

Fundo da Tela: Branco puro ou cinza bem claro.

Sugestão de HEX: #FFFFFF (Branco) ou #F5F5F5 (Cinza Claro).

Fundo de Seções/Cards: Branco.

Sugestão de HEX: #FFFFFF.

Texto Principal: Cinza escuro ou preto.

Sugestão de HEX: #212121 ou #424242.

Texto Secundário/Labels: Cinza médio.

Sugestão de HEX: #757575 ou #9E9E9E.

Divisores/Bordas: Cinza muito claro.

Sugestão de HEX: #E0E0E0.

Status/Feedback:

Sucesso (Presença/Concluído): Verde.

Sugestão de HEX: #4CAF50 (Verde Material Design).

2. Tipografia
A fonte parece ser uma sans-serif moderna, limpa e legível, ideal para interfaces mobile. A família "Inter" que você já está usando é uma ótima escolha e se encaixa perfeitamente.

Família de Fonte: Inter (ou similar sans-serif como Roboto, Open Sans).

Pesos da Fonte:

Bold (700): Para títulos de seção, números em KPIs, nomes de alunos em destaque.

Semi-Bold (600): Para subtítulos, labels importantes, texto de botões.

Regular (400): Para corpo de texto, descrições, labels menores.

Tamanhos (Sugestões em rem ou px para referência):

Título de Tela (H1): 2rem (32px) a 2.5rem (40px) - ex: "Olá, Everton!"

Título de Seção (H2): 1.5rem (24px) a 1.75rem (28px) - ex: "Treinos de Hoje"

Números KPI: 3rem (48px) a 4rem (64px) - ex: "15" em "Treinos de Hoje"

Texto de Card/Nome Aluno: 1rem (16px) a 1.125rem (18px)

Labels/Detalhes Menores: 0.875rem (14px) a 0.75rem (12px)

3. Espaçamento e Margens
Há uma consistência visual que sugere um sistema de espaçamento baseado em múltiplos de 4px ou 8px (padrão Tailwind).

Espaçamento Interno (Padding):

Cards/Seções: p-4 (16px) ou p-6 (24px).

Itens de Lista: py-2 (8px) ou py-3 (12px) vertical, px-4 (16px) horizontal.

Espaçamento Externo (Margin/Gap):

Entre Seções/Cards: mb-6 (24px) ou mb-8 (32px).

Entre Elementos Internos (Flex/Grid Gap): gap-2 (8px) ou gap-4 (16px).

Margens Laterais da Tela: px-4 (16px) ou px-6 (24px) para o conteúdo principal.

4. Componentes e Estilos
Cards:

bg-white

rounded-lg (arredondamento médio, ex: 0.5rem ou 0.75rem)

shadow-md (sombra suave)

p-4 ou p-6 (padding interno)

Botões:

FAB (Floating Action Button): Círculo, bg-pink-500 (ou a cor primária), shadow-lg, ícone centralizado, rounded-full.

Botões de Ação (ex: "Marcar Presença"): bg-green-500 (ou cor de status), text-white, rounded-md ou rounded-lg, py-2 px-4.

Navegação Inferior (Bottom Navigation Bar):

bg-white

shadow-lg (sombra para destacar do conteúdo)

Ícones com texto abaixo.

Item ativo com cor primária (rosa/magenta) e texto em negrito.

Inputs/Campos de Formulário:

Bordas sutis, rounded-md, p-3 ou p-4.

Fundo branco ou cinza bem claro.

Avatares:

rounded-full para fotos de perfil.

w-12 h-12 (ou tamanhos similares) para dimensões.

Com essa transcrição, você tem um guia claro para implementar o design usando Tailwind CSS e React Native. Vai te economizar tempo e garantir que o app tenha uma cara profissional e consistente.