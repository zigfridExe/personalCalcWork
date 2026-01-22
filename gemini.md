# Contexto do Projeto: personalCalcWork

## Visão Geral do Projeto

O objetivo deste projeto é desenvolver um aplicativo móvel para personal trainers gerenciarem seus alunos de forma eficiente. O aplicativo permitirá o cadastro de alunos, a criação de fichas de treino, o acompanhamento da evolução, a gestão de agendamentos e o controle de pagamentos.

## Tipo de Projeto

- **Aplicativo Móvel** desenvolvido com **React Native** e **Expo**.

## Funcionalidades Principais (MVP)

- Cadastro e gestão de alunos.
- Criação e visualização de fichas de treino.
- Calendário para agendamento de aulas e treinos.
- Tela de configurações básicas.

## Roteiro de Desenvolvimento (Roadmap)

- Integração com sistemas de pagamento.
- Gráficos de evolução de desempenho.
- Notificações para alunos e personal trainers.
- Funcionalidades online e sincronização de dados.

## Tecnologias Chave

- **Framework:** React Native com Expo
- **Linguagem:** TypeScript
- **Gerenciador de Pacotes:** npm

## Comandos de Desenvolvimento

- **`npm start`**: Inicia o servidor de desenvolvimento do Expo.
- **`npm run android`**: Executa o aplicativo no emulador ou dispositivo Android.
- **`npm run ios`**: Executa o aplicativo no emulador ou dispositivo iOS.
- **`npm run web`**: Executa o aplicativo em um navegador web.

## Registro de Alterações Recentes (Sprint de Polimento - Jan 2026)

### 1. Padronização Visual (Design System)
- **Tema Escuro:** Implementado globalmente (fundo preto/cinza, elementos em destaque amarelo #FFB700).
- **Tipografia:** Integrado `Roboto` e `Source Sans Pro` via `expo-google-fonts`.
- **Componentes:** Padronização de botões, inputs e cards em todo o app.

### 2. Padronização de Datas
- **Data Utils:** Criado `src/utils/dateUtils.ts` para centralizar formatação e parsing.
- **Formato:** UX em `DD-MM-AAAA`, Banco em `YYYY-MM-DD`.
- **Máscaras:** Inputs de data com máscara automática.

### 3. Refatoração do Calendário (Headless)
- **Virtualização:** Lógica de recorrência calculada em tempo de leitura (não gera registros futuros no banco).
- **Store:** `useAulasStore` gerencia visualização e ações.
- **Acesso Rápido:** Adicionado botão de "Fichas" no card de aula.

### 4. Melhorias Gerais
- **Modais:** Todos os modais (Ficha, Treino, Aluno) padronizados com o novo tema.
- **Navegação:** Headers e TabBar ajustados para o tema amarelo/preto.
