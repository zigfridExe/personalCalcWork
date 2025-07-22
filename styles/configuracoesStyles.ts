import { StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE } from '../constants/Theme';
import commonStyles from './commonStyles';

const configuracoesStyles = StyleSheet.create({
  container: {
    ...commonStyles.screenContainer,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...commonStyles.screenTitle,
    textAlign: 'left',
    marginBottom: 30,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonWrapper: {
    marginHorizontal: 4,
    flex: 1,
    minWidth: 150,
    maxWidth: 180,
    height: 48,
    justifyContent: 'center',
  },
  backupContainer: {
    marginTop: 32,
  },
  backupButtonSpacer: {
    height: 12,
  },
  migrationContainer: {
    marginVertical: 16,
  },
  lookAheadContainer: {
    marginVertical: 20,
  },
  lookAheadTitle: {
    ...commonStyles.labelText,
    color: COLORS.text,
    marginBottom: 6,
  },
  lookAheadControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    padding: 8,
  },
  lookAheadValue: {
    marginHorizontal: 16,
    fontSize: FONT_SIZE.h3 - 2, // Usando h3 como base para o tamanho da fonte
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'center',
  },
  logButtonContainer: {
    marginVertical: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    marginBottom: 12,
    color: COLORS.text,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  settingText: {
    ...commonStyles.bodyText,
    color: COLORS.text,
    flex: 1,
  },
});

export default configuracoesStyles;
