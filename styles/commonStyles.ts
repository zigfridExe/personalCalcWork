import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, BUTTON, CARD } from '../constants/Theme';

// Estilos comuns reutilizáveis em todo o app
export const commonStyles = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 30,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },

  // Títulos e textos
  screenTitle: {
    fontSize: FONT_SIZE.h1,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.h2,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.white,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: FONT_SIZE.subtitle,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.primary,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.white,
    lineHeight: 22,
  },
  labelText: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.white,
    marginBottom: 8,
  },

  // Cards
  card: {
    ...CARD,
    width: '100%',
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: FONT_SIZE.subtitle,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.white,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.grayLight,
  },

  // Botões
  primaryButton: {
    backgroundColor: BUTTON.states.enabled.backgroundColor,
    borderRadius: BUTTON.borderRadius,
    paddingVertical: 14,
    paddingHorizontal: BUTTON.paddingHorizontal,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  primaryButtonText: {
    color: BUTTON.states.enabled.color,
    fontFamily: BUTTON.fontFamily,
    fontSize: BUTTON.fontSize,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BUTTON.borderRadius,
    paddingVertical: 12,
    paddingHorizontal: BUTTON.paddingHorizontal,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontFamily: BUTTON.fontFamily,
    fontSize: BUTTON.fontSize,
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF4444',
    borderRadius: BUTTON.borderRadius,
    paddingVertical: 14,
    paddingHorizontal: BUTTON.paddingHorizontal,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  dangerButtonText: {
    color: COLORS.white,
    fontFamily: BUTTON.fontFamily,
    fontSize: BUTTON.fontSize,
    textAlign: 'center',
  },
  smallButton: {
    backgroundColor: BUTTON.states.enabled.backgroundColor,
    borderRadius: BUTTON.borderRadius,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  smallButtonText: {
    color: BUTTON.states.enabled.color,
    fontFamily: BUTTON.fontFamily,
    fontSize: 14,
  },

  // Inputs
  input: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.secondary,
  },
  textArea: {
    width: '100%',
    minHeight: 100,
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.secondary,
    textAlignVertical: 'top',
  },

  // Listas
  listItem: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemContent: {
    flex: 1,
    marginRight: 12,
  },
  listItemTitle: {
    fontSize: FONT_SIZE.subtitle,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.white,
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.grayLight,
  },

  // Status e badges
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
    textTransform: 'uppercase',
  },
  successBadge: {
    backgroundColor: '#4CAF50',
  },
  warningBadge: {
    backgroundColor: '#FF9800',
  },
  errorBadge: {
    backgroundColor: '#FF4444',
  },
  infoBadge: {
    backgroundColor: '#2196F3',
  },

  // Separadores
  divider: {
    height: 1,
    backgroundColor: COLORS.grayLight,
    marginVertical: 16,
    opacity: 0.3,
  },
  spacer: {
    height: 20,
  },

  // Modais
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZE.h2,
    fontFamily: FONT_FAMILY.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default commonStyles;
