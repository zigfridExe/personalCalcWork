
import { Platform } from 'react-native';

export const theme = {
    colors: {
        primary: '#FFB700', // Amarelo
        background: '#000000', // Preto
        text: '#FFFFFF', // Branco
        textSecondary: '#333333', // Cinza Escuro
        card: '#1A1A1A', // Cinza um pouco mais claro para cartões
        border: '#333333',
        success: '#4CAF50',
        danger: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
        transparent: 'transparent',
    },

    fonts: {
        title: 'RobotoCondensed_700Bold', // Roboto Condensed Bold
        regular: 'Roboto_400Regular', // Roboto Regular
        italic: 'Roboto_400Regular_Italic', // Roboto Italic
        secondary: 'SourceSansPro_400Regular', // Source Sans Pro Regular
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 40,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
        round: 9999,
    },
};
