import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, CARD } from '../constants/Theme';
import commonStyles from './commonStyles';

const calendarioStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: 30,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.primary,
    marginVertical: 10,
  },
  // Reutiliza o card dos estilos comuns
  aulaCard: {
    ...commonStyles.card,
    backgroundColor: COLORS.white,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  aulaHora: {
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    fontSize: FONT_SIZE.text,
  },
  aulaAluno: {
    fontSize: FONT_SIZE.text - 1,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.secondary,
  },
  aulaTipo: {
    fontSize: FONT_SIZE.text - 3,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.secondary,
    marginTop: 2,
    marginBottom: 2,
  },
  aulaStatus: {
    fontSize: FONT_SIZE.text - 3,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.primary,
  },
  aulaObs: {
    fontSize: FONT_SIZE.text - 4,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.secondary,
    marginTop: 4,
    opacity: 0.8,
  },
  aulaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  novaAulaContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  novaAulaBox: {
    width: '95%',
    backgroundColor: COLORS.white,
    borderRadius: CARD.borderRadius,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 8,
    shadowColor: COLORS.secondary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  novaAulaTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.text,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  novaAulaButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  list: {
    width: '100%',
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default calendarioStyles;
