import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, BUTTON } from '../constants/Theme';
import commonStyles from './commonStyles';

const editarAulaStyles = StyleSheet.create({
  container: {
    ...commonStyles.screenContainer,
    padding: 20,
  },
  title: {
    ...commonStyles.screenTitle,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    ...commonStyles.input,
    width: '80%',
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  inputDisabled: {
    backgroundColor: COLORS.backgroundLight,
    color: COLORS.textTertiary,
  },
  pickerWrapper: {
    ...commonStyles.input,
    width: '80%',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  pickerItem: {
    fontSize: FONT_SIZE.text,
    fontFamily: FONT_FAMILY.regular,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    justifyContent: 'space-between',
    gap: 10,
  },
  tipoBtn: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BUTTON.borderRadius,
    marginRight: 8,
  },
  tipoBtnAtivo: {
    backgroundColor: COLORS.primary,
  },
  label: {
    ...commonStyles.labelText,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 2,
    color: COLORS.text,
  },
  diasSemanaContainer: {
    width: '80%',
    marginBottom: 15,
  },
  diasSemanaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  diaBtn: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BUTTON.borderRadius,
    marginRight: 6,
    marginBottom: 6,
  },
  diaBtnAtivo: {
    backgroundColor: COLORS.primary,
  },
  alunoInfoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    padding: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    width: '80%',
  },
  alunoNome: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.h3,
    color: COLORS.text,
    textAlign: 'center',
  },
  contatoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  whatsappButton: {
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappText: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  ligarText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tipoButtonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '80%',
    justifyContent: 'center',
  },
  tipoButtonTextAtivo: {
    color: COLORS.white,
    fontFamily: FONT_FAMILY.semiBold,
  },
  tipoButtonTextInativo: {
    color: COLORS.textTertiary,
    fontFamily: FONT_FAMILY.regular,
  },
});

export default editarAulaStyles;
