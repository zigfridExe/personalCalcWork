// Estilos globais e padrões do projeto conforme PROJETO.MD
export const COLORS = {
  primary: '#FF4E50', // Rosa/Magenta vibrante
  secondary: '#FC913A', // Laranja/Salmão
  success: '#4CAF50', // Verde para ações de sucesso
  background: '#F5F5F5', // Cinza claro
  card: '#FFFFFF', // Branco para cards
  textPrimary: '#212121', // Cinza escuro/preto
  textSecondary: '#757575', // Cinza médio
  border: '#E0E0E0', // Cinza muito claro
};

export const FONT = {
  family: 'Inter',
  weights: {
    bold: 'bold', // React Native aceita 'bold' ou número
    semiBold: '600',
    regular: '400',
  },
  sizes: {
    h1: 32,
    h2: 24,
    kpi: 48,
    cardTitle: 16,
    label: 14,
    small: 12,
  },
};

export const SPACING = {
  padding: {
    card: 16,
    section: 24,
    input: 12,
  },
  margin: {
    section: 32,
    card: 24,
  },
  gap: {
    small: 8,
    medium: 16,
  },
};

export const CARD = {
  backgroundColor: COLORS.card,
  borderRadius: 12,
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  padding: SPACING.padding.card,
};

export const BUTTON = {
  fab: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    shadow: {
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    size: 56,
  },
  action: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    color: '#fff',
  },
};

export const INPUT = {
  borderColor: COLORS.border,
  borderRadius: 8,
  padding: 12,
  backgroundColor: COLORS.card,
};

export const AVATAR = {
  borderRadius: 999,
  size: 48,
};

export const NAVBAR = {
  backgroundColor: COLORS.card,
  shadow: BUTTON.fab.shadow,
  itemActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  itemInactive: {
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
};
