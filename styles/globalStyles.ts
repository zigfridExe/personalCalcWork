import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, BUTTON, CARD, NAVBAR } from '../constants/Theme';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: FONT_SIZE.h1,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.h2,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.white,
  },
  input: {
    width: '90%',
    height: 44,
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.secondary,
  },
  button: {
    backgroundColor: BUTTON.states.enabled.backgroundColor,
    borderRadius: BUTTON.borderRadius,
    paddingVertical: 14,
    paddingHorizontal: BUTTON.paddingHorizontal,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: BUTTON.states.enabled.color,
    fontFamily: BUTTON.fontFamily,
    fontSize: BUTTON.fontSize,
    textAlign: 'center',
  },
  card: {
    ...CARD,
    width: '95%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  navbar: {
    width: '100%',
    height: NAVBAR.height,
    backgroundColor: NAVBAR.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: NAVBAR.backgroundColor,
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  navbarTitle: {
    color: NAVBAR.textColor,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h2,
    letterSpacing: 1,
  },
});

export default globalStyles;
