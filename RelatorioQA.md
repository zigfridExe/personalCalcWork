Guia de Testes QA

1. Alunos
    - Listagem de alunos
        * Visualizar lista de alunos cadastrados ok ok
        * Exibir nome, foto (se houver), data de nascimento e telefone ok
    - Cadastro de aluno
        * Abrir modal de cadastro ok ok
        * Preencher campos obrigatórios: nome, telefone, data de nascimento, foto (opcional) ok
        * Salvar novo aluno ok ok
        * Tentar salvar sem preencher campos obrigatórios - deve mostrar erro
            Erro nao esta tratado a normalização dos dados Consertado
    - Edição de aluno
        * Editar dados do aluno ok ok
        * Alterar/remover foto ok ok
        * Remover aluno ok ok
    - Funcionalidades do aluno
        * Avaliação física: acessar e preencher avaliação simplificada
            *Ficha de avaliação física precisa de tratamento de layout ta muito feio e nomalização dos dados(Implementar possivelmente cadastramento por pagina de rolagem)
            *Campo de observação tem que comportar mais caracteres visiveis.
        * Fichas: acessar e gerenciar fichas de treino do aluno
            *Ao copiar uma ficha de treino para outro aluno assim que é finalizada a copia ela aparece nas fichas de treino do aluno atual
            Ao iniciar um treino sem exercicios ele tenta procurar o treino e nao tem(looping)
            * novo exercicio series podera ser uma quantidade padrão 1x 2x 3x 4x.
            *Repetições 12 ou 15 e até a falha
            *complementar o campo com Kg fora do campo de imput do usuário
            *opção de descanso está ambigua com a informação presente na criação da ficha de exercicio remover o item da no cadastro da ficha pois fica mais preciso (cada exercicio pode ter um tempo diferente)
            *lista de exercicios existe um padrão o exercicio de costas ja temos uma lista disso no drive do zigfrid.exe@gmail.com deve ficar em um quadro de exercicios(devemos pensar em algo mais dinamico para montagem dessa ficha)
        * IMC: calcular e visualizar IMC
            Erro no calculo de IMC
        * Nova medida: adicionar nova medida corporal
        * Histórico: visualizar histórico de treinos e medidas

2. Fichas de Treino
    - Criar ficha de treino para aluno
    - Adicionar/excluir/editar exercícios na ficha
    - Copiar ficha para outro dia/aluno
    - Visualizar ficha de treino atual do aluno
    - Visualizar ficha durante o treino ativo

3. Execução do Treino (Treino Ativo)
    - Iniciar sessão de treino para um aluno
    - Exibir exercício atual, séries, repetições/tempo, carga
    - Marcar série como concluída
    - Registrar carga/repetições reais por série
    - Anotações rápidas durante o treino
    - Cronômetro integrado para exercícios de tempo
    - Temporizador de descanso com alerta sonoro/vibração
    - Resumo rápido do histórico do exercício
    - Salvamento automático do treino no histórico

4. Histórico
    - Visualizar histórico completo do aluno
    - Visualizar histórico de medidas
    - Visualizar histórico de treinos

5. Avaliação Física Simplificada
    - Calcular IMC e salvar resultado no perfil do aluno
    - Registrar peso, altura e circunferências
    - Visualizar histórico de medidas

6. Calendário de Aulas
    - Visualizar aulas agendadas no calendário (mensal/diário)
    - Diferenciar aulas avulsas, recorrentes, sobrescritas e canceladas
    - Agendar nova aula (selecionar aluno, data, hora, duração, tipo, observações)
    - Agendar aula recorrente (selecionar dias da semana, data de início, limite de recorrência)
    - Editar aula avulsa ou recorrente
    - Sobrescrever/cancelar ocorrência individual de aula recorrente
    - Cancelar toda a recorrência
    - Marcar/desmarcar presença do aluno na aula
    - Atualização imediata do calendário após qualquer operação

7. Backup e Restauração
    - Exportar backup do banco de dados SQLite
    - Importar backup (com aviso de perda de dados)
    - Confirmar integridade dos dados após restauração

8. Configurações
    - Alterar tema (claro/escuro)
    - Limpar banco de dados (reset total)
    - Testar funções de limpeza e regeneração de aulas

// Adicione abaixo os próximos testes conforme for executando