import { StyleSheet } from 'react-native';
import Colors from './Colors';

// Cores do tema conforme padraoLayout.md
const themeColors = {
  primary: '#FFB700',  // Amarelo
  black: '#000000',    // Preto
  white: '#FFFFFF',    // Branco
  darkGray: '#333333', // Cinza Escuro
  lightGray: '#E0E0E0', // Cinza Claro
  error: '#F44336'     // Vermelho para erros
};

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: themeColors.black, // Fundo preto conforme padrão
  },
  
  // Título
  title: {
    fontSize: 24,
    fontFamily: 'RobotoCondensed-Bold', // Fonte Roboto Condensed Bold
    color: themeColors.white, // Texto branco para contraste
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
    borderColor: themeColors.darkGray, // Borda cinza escuro
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: themeColors.white, // Texto branco
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fundo levemente translúcido
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
    borderColor: themeColors.primary, // Borda amarela
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: themeColors.darkGray,
  },
  imagePlaceholderText: {
    fontSize: 48,
    fontFamily: 'Roboto-Bold',
    color: themeColors.white,
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
    backgroundColor: themeColors.primary, // Fundo amarelo
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 180,
    alignItems: 'center',
    elevation: 2, // Sombra sutil
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.primary, // Borda amarela
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: themeColors.black, // Texto preto para botão primário
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'uppercase',
  },
  secondaryButtonText: {
    color: themeColors.primary, // Texto amarelo para botão secundário
    fontFamily: 'Roboto-Bold',
  },
  
  // Mensagens de erro
  errorText: {
    color: themeColors.error,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  
  // Placeholder personalizado
  placeholderText: {
    color: '#999999',
  },
});
