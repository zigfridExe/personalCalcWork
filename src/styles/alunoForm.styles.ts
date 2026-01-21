import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: theme.colors.background, // Fundo preto conforme padrão
  },

  // Título
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title, // Fonte Roboto Condensed Bold
    color: theme.colors.text, // Texto branco (ou primário, se preferir destaque)
    marginBottom: 32,
    textAlign: 'center',
  },

  // Inputs
  input: {
    // Estilo base para inputs
  },
  textInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    fontFamily: theme.fonts.regular,
  },
  lastInput: {
    marginBottom: 32,
  },

  // Seção de imagem
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: theme.colors.primary, // Borda amarela
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  imagePlaceholderText: {
    fontSize: 48,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
  },

  // Botões de foto
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },

  // Estilos de botões
  primaryButton: {
    backgroundColor: theme.colors.primary, // Fundo amarelo
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 180,
    alignItems: 'center',
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary, // Borda amarela
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background, // Texto preto (sobre amarelo)
    fontSize: 16,
    fontFamily: theme.fonts.title,
    textTransform: 'uppercase',
  },
  secondaryButtonText: {
    color: theme.colors.primary, // Texto amarelo
    fontFamily: theme.fonts.title,
  },

  // Mensagens de erro
  errorText: {
    color: theme.colors.danger,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },

  // Placeholder personalizado (não usado diretamente no style, mas útil como referência)
  placeholderText: {
    color: theme.colors.textSecondary,
  },
});
