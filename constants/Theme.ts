// Theme centralizado para o app Smart Fit
// Cores, tipografia e estilos base

export const COLORS = {
  primary: '#FFB800', // amarelo
  secondary: '#232323', // cinza escuro
  tertiary: '#232A3D', // azul escuro
  background: '#232323',
  white: '#FFFFFF',
  grayLight: '#F2F2F2',
};

export const FONT_FAMILY = {
  regular: 'Montserrat-Regular',
  bold: 'Montserrat-Bold',
  semiBold: 'Montserrat-SemiBold',
  extraBold: 'Montserrat-ExtraBold',
};

export const FONT_SIZE = {
  h1: 32,
  h2: 24,
  h3: 20,
  subtitle: 18,
  text: 16,
};

export const BUTTON = {
  height: 48,
  borderRadius: 8,
  paddingHorizontal: 16,
  fontFamily: FONT_FAMILY.bold,
  fontSize: FONT_SIZE.text,
  states: {
    enabled: {
      backgroundColor: COLORS.primary,
      color: COLORS.secondary,
    },
    pressed: {
      backgroundColor: COLORS.tertiary,
      color: COLORS.white,
    },
    disabled: {
      backgroundColor: COLORS.grayLight,
      color: COLORS.secondary,
    },
  },
};

export const CARD = {
  backgroundColor: COLORS.secondary,
  borderRadius: 12,
  padding: 16,
  shadowColor: COLORS.tertiary,
  shadowOpacity: 0.1,
};

export const NAVBAR = {
  backgroundColor: COLORS.secondary,
  height: 56,
  iconColor: COLORS.primary,
  textColor: COLORS.white,
};

// Exemplo de uso:
// import { COLORS, FONT_FAMILY, FONT_SIZE, BUTTON } from '../constants/Theme';
// <Text style={{ fontFamily: FONT_FAMILY.bold, fontSize: FONT_SIZE.h1, color: COLORS.primary }}>Título</Text>
