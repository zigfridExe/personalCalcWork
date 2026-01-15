
import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const alunoCardStyles = StyleSheet.create({
  // Container principal do card
  container: {
    backgroundColor: theme.colors.card, // Fundo do cartão
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Linha de informações (imagem + detalhes)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },

  // Container das informações do aluno
  infoContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },

  // Nome do aluno
  nome: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 6,
  },

  // Detalhes do aluno (nascimento, telefone)
  detalhe: {
    fontSize: 14,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },

  // Container da imagem do aluno
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },

  // Imagem do aluno
  image: {
    width: '100%',
    height: '100%',
  },

  // Texto do placeholder da imagem
  placeholderText: {
    fontSize: 28,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
  },

  // Linha de botões
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },

  // Container do botão
  buttonContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Estilo base para os botões
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Botão primário (amarelo com fundo)
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  // Botão de perigo (vermelho com fundo)
  dangerButton: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },

  // Botão secundário (borda amarela com fundo transparente) - Mudança conforme padrão
  secondaryButton: {
    backgroundColor: theme.colors.transparent,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },

  // Estilo base para o texto dos botões
  buttonText: {
    fontFamily: theme.fonts.regular,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },

  // Texto do botão primário
  primaryButtonText: {
    color: theme.colors.background, // Texto preto
  },

  // Texto do botão de perigo
  dangerButtonText: {
    color: theme.colors.text, // Texto branco
  },

  // Texto do botão secundário
  secondaryButtonText: {
    color: theme.colors.primary, // Texto amarelo
  },
});

// Cores dos botões para reutilização
export const buttonColors = {
  primary: '#FFB700',     // Amarelo - Botão primário
  secondary: '#333333',   // Cinza escuro - Botão secundário com borda
  info: '#333333',        // Cinza escuro - Para informações
  warning: '#FFB700',     // Amarelo - Para avisos
  danger: '#FF3B30',      // Vermelho - Para ações perigosas
  default: '#333333',     // Cinza escuro - Padrão
};

export default alunoCardStyles;
