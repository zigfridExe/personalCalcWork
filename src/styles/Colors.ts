
import { theme } from './theme';

const tintColorLight = theme.colors.primary;
const tintColorDark = theme.colors.primary;

export default {
  light: {
    text: theme.colors.background, // Texto escuro em fundo claro (inverso)
    background: theme.colors.text, // Fundo claro (inverso)
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    // Adicionando cores do tema para acesso global se necessário
    primary: theme.colors.primary,
  },
  dark: {
    text: theme.colors.text,
    background: theme.colors.background,
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: theme.colors.primary, // Adicionado para consistência
  },
};
