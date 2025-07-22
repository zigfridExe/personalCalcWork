import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../constants/Theme';
import commonStyles from './commonStyles';

const avaliacaoStyles = StyleSheet.create({
  container: {
    ...commonStyles.centeredContainer,
    padding: 20,
  },
  title: {
    ...commonStyles.screenTitle,
    marginBottom: 20,
  },
  infoBox: {
    ...commonStyles.card,
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 15,
    marginBottom: 20,
  },
  infoTitle: {
    ...commonStyles.subtitle,
    color: COLORS.primary,
    marginBottom: 8,
  },
  infoItem: {
    ...commonStyles.bodyText,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 15,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: COLORS.text,
    alignSelf: 'flex-start',
  },
  emptyText: {
    ...commonStyles.bodyText,
    color: COLORS.textTertiary,
    marginBottom: 20,
  },
  historicoItem: {
    ...commonStyles.card,
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 10,
  },
  historicoData: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    marginBottom: 2,
    fontSize: FONT_SIZE.text - 1,
  },
  historicoInfo: {
    fontSize: FONT_SIZE.text - 2,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.secondary,
    lineHeight: 20,
  },
});

export default avaliacaoStyles;
