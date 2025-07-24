import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, BUTTON } from '../constants/Theme';
import commonStyles from './commonStyles';
import globalStyles from './globalStyles';

// Cores personalizadas para os cards
const CUSTOM_COLORS = {
  cardBackground: '#2D2D2D',
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  buttonBackground: BUTTON.states.enabled.backgroundColor,
  buttonText: BUTTON.states.enabled.color,
  deleteButton: COLORS.error,
};

const alunosStyles = StyleSheet.create({
  // Estilo do card principal
  card: {
    backgroundColor: CUSTOM_COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Container do conteúdo do card (foto + informações)
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Estilo da imagem de perfil
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.buttonBackground,
    marginRight: 16,
  },
  // Container para a inicial do nome
  profileInitialContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: CUSTOM_COLORS.buttonBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  // Texto da inicial
  profileInitialText: {
    fontSize: 28,
    fontFamily: FONT_FAMILY.bold,
    color: CUSTOM_COLORS.textPrimary,
  },
  // Container das informações do aluno
  infoContainer: {
    flex: 1,
  },
  // Nome do aluno
  studentName: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: CUSTOM_COLORS.textPrimary,
    marginBottom: 4,
  },
  // Texto de informações (telefone, idade)
  infoText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.regular,
    color: CUSTOM_COLORS.textSecondary,
    marginBottom: 2,
  },
  // Container dos botões
  buttonsContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  // Linha de botões
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  // Botão padrão
  button: {
    flex: 1,
    backgroundColor: COLORS.primary, // Amarelo (#FFB800)
    borderRadius: 6, // 6px border radius
    paddingVertical: 10, // 10px vertical
    paddingHorizontal: 16, // 16px horizontal
    marginHorizontal: 2, // 4px entre botões (2px de cada lado)
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Altura mínima de 44px para toque
  },
  // Estado pressionado do botão
  buttonPressed: {
    backgroundColor: COLORS.tertiary, // Cor de fundo quando pressionado
  },
  // Estado desativado do botão
  buttonDisabled: {
    backgroundColor: COLORS.gray, // Cor de fundo quando desativado
    opacity: 0.6,
  },
  // Texto do botão
  buttonText: {
    color: COLORS.secondary, // Preto (#232323)
    fontSize: 14, // 14px
    fontFamily: FONT_FAMILY.semiBold, // Montserrat-SemiBold
    textAlign: 'center',
  },
  // Texto do botão pressionado
  buttonTextPressed: {
    color: COLORS.white, // Branco quando pressionado
  },
  // Texto do botão desativado
  buttonTextDisabled: {
    color: COLORS.secondary, // Preto com opacidade reduzida
    opacity: 0.6,
  },
  // Botão de excluir (estado normal)
  deleteButton: {
    backgroundColor: COLORS.error, // Vermelho (#FF4444)
  },
  // Botão de excluir pressionado
  deleteButtonPressed: {
    backgroundColor: COLORS.error, // Vermelho um pouco mais escuro quando pressionado
    opacity: 0.8,
  },
  // Texto do botão de excluir
  deleteButtonText: {
    color: COLORS.white, // Branco
    fontSize: 14, // 14px
    fontFamily: FONT_FAMILY.semiBold, // Montserrat-SemiBold
    textAlign: 'center',
  },
  // Lista de alunos
  list: {
    width: '100%',
    padding: 12,
    backgroundColor: '#12121A',
  },
  titulo: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  semAlunos: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
  resetButton: {
    backgroundColor: COLORS.warning,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
  },
});

export default alunosStyles;
