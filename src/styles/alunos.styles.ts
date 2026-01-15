
import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const alunosStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Fundo escuro do tema
    paddingTop: 16,
  },

  // Container do conteúdo que pode rolar
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Lista de alunos
  list: {
    width: '100%',
    paddingHorizontal: 16,
  },

  // Botão de cadastrar novo aluno
  cadastrarButton: {
    backgroundColor: theme.colors.primary, // Amarelo conforme o padrão
    padding: 16,
    borderRadius: theme.borderRadius.md,
    width: '90%',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Texto do botão de cadastrar
  cadastrarButtonText: {
    color: theme.colors.background, // Preto para contraste com o fundo amarelo
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.title,
    textTransform: 'uppercase',
  },

  // Mensagem quando não há alunos cadastrados
  emptyMessage: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    paddingHorizontal: 32,
    fontFamily: theme.fonts.regular,
  },

  // Container do botão flutuante (se necessário no futuro)
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    elevation: 8,
  },
});

export default alunosStyles;
