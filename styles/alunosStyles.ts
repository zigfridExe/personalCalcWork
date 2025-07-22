import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../constants/Theme';
import commonStyles from './commonStyles';
import globalStyles from './globalStyles';

const alunosStyles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: commonStyles.card.backgroundColor,
  },
  profileInitialContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: commonStyles.card.backgroundColor,
  },
  profileInitialText: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.secondary,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 2,
  },
  buttonWrapper: {
    marginHorizontal: 2,
    flex: 1,
  },
  deleteButton: {
    ...commonStyles.dangerButton,
    backgroundColor: COLORS.error || '#FF4444',
  },
  deleteButtonText: {
    ...commonStyles.dangerButtonText,
    color: COLORS.white,
  },
  list: {
    width: '100%',
    marginTop: 0,
    padding: 8,
  },
  // Estilo para o container de botões de ação
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  // Estilo para o texto de informações do aluno
  infoText: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.white,
    marginBottom: 4,
  },
  // Estilo para o título das informações
  infoLabel: {
    fontSize: FONT_SIZE.text - 1,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 4,
  },
});

export default alunosStyles;
