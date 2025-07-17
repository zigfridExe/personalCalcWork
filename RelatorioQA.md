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
            *data encontrase nao normalizada e deve trazer a data atual para registro
        * Histórico: visualizar histórico de treinos e medidas
            *Historico de medidas nao é exibido assim que retorna para tela de historico apos salvar os dados

2. Fichas de Treino
    - Criar ficha de treino para aluno ok
    - Adicionar/excluir/editar exercícios na ficha ok
    - Copiar ficha para outro dia/aluno
        *Ficha de aluno quando copiada para outro aluno é exibida na ficha do aluno atual apos voltar a tela e conferir no outro aluno voltando ele ja nao exibi a duplicidade
    - Visualizar ficha de treino atual do aluno ok
    - Visualizar ficha durante o treino ativo ok

3. Execução do Treino (Treino Ativo)
    - Iniciar sessão de treino para um aluno ok
    - Exibir exercício atual, séries, repetições/tempo, carga ok
    - Marcar série como concluída ok
    - Registrar carga/repetições reais por série
        Informação nao pode adicionada por falta de campos
    - Anotações rápidas durante o treino ok
    - Cronômetro integrado para exercícios de tempo ok
    - Temporizador de descanso com alerta sonoro/vibração ok
    - Resumo rápido do histórico do exercício ok
    - Salvamento automático do treino no histórico ok

4. Histórico
    *critico os historicos estão de forma espalhada no cadastro do aluno tem um botão historico que não exibi um historico completo
    - Visualizar histórico completo do aluno Parcial
    - Visualizar histórico de medidas ok (esta em avaliação fisica)
    - Visualizar histórico de treinos ok (esta na ficha de avliação do aluno)

5. Avaliação Física Simplificada
    - Calcular IMC e salvar resultado no perfil do aluno ok
    - Registrar peso, altura e circunferências ok
    - Visualizar histórico de medidas ok

6. Calendário de Aulas
    - Layout
        Calendário mais largo ocupando laterais esquerda e direita da tela
            Identifiquei que as palavras estão se repetindo muitas vezes tem calendário no rodapé no titulo em cima e em cima do calendário muitas repetições
    - Agendar aula recorrente (selecionar dias da semana, data de início, limite de recorrência)
        Não existe opção para adicionar data final da recorrência.
        Criação da aula recorrente para o mês subsequente não é exibida no calendário (talvez seja necessário persistir criar uma função para atualizar as aulas de acordo com o mês)
        *Tipo de aula devera ser a primeira opção antes do nome do aluno

    - Agendar nova aula (selecionar aluno, data, hora, duração, tipo, observações) ok
    - Visualizar aulas agendadas no calendário (mensal/diário)
        tratamento de aulas duplicadas no calendário marquei uma aula avulsa e uma recorrente para o mesmo dia e ele so mostra uma(criar chave unica de aula e separalas como tal)
    - Diferenciar (adicionar legenda das cores de ocorrência)
        Adicionar status da aula no card de aula
            Agendada
            Cancelada
            Sobrescrita
        aulas avulsas
        recorrentes
        sobrescritas
        canceladas
    - Editar aula
        avulsa
        recorrente
    - Sobrescrever/cancelar ocorrência individual de aula recorrente ok
    - Cancelar toda a recorrência
        Função apagar todas as aulas não esta apagando elas de verdade O botão apocalipse faz isso
    - Marcar/desmarcar presença do aluno na aula ok
    - Atualização imediata do calendário após qualquer operação
        faltou atualizar quando usei a função apagar todas as aulas

7. Backup e Restauração
    - Exportar backup do banco de dados SQLite
        o botao exportar banco de dados exibe a mensagem banco de dados não encontrado
    - Importar backup (com aviso de perda de dados)
        Não foi possivel fazer o backup.
        Botão importar funciona e abre o gerenciador de arquivos porem como nao foi possivel exportar o arquivo.
    - Confirmar integridade dos dados após restauração

8. Configurações
    - Alterar tema (claro/escuro)
        Não implementado mas segue o configuração do sistema do celular
    - Limpar banco de dados (reset total)
    - Testar funções de limpeza e regeneração de aulas
        Limpeza de emergencia funcionando corretamente
        Tegeneração de aulas recorrentes esta regenerando aula avulsa
        implementar que a limpeza de todas as aulas não apague as aulas que já estão com presença

