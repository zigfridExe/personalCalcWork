// Arquivo central de estilos - Exporta todos os estilos do app
// Facilita importação e manutenção

// Estilos base
export { default as globalStyles } from './globalStyles';
export { default as commonStyles } from './commonStyles';

// Estilos por tela/componente
export { default as alunosStyles } from './alunosStyles';
export { default as avaliacaoStyles } from './avaliacaoStyles';
export { default as calendarioStyles } from './calendarioStyles';
export { default as configuracoesStyles } from './configuracoesStyles';
export { default as editarAulaStyles } from './editarAulaStyles';
export { default as fichasStyles } from './fichasStyles';
export { default as historicoStyles } from './historicoStyles';
export { default as horariosStyles } from './horariosStyles';
export { default as imcStyles } from './imcStyles';
export { default as indexStyles } from './indexStyles';
export { default as notFoundStyles } from './notFoundStyles';
export { default as novaAulaStyles } from './novaAulaStyles';
export { default as novaMedidaStyles } from './novaMedidaStyles';
export { default as novaRecorrenteStyles } from './novaRecorrenteStyles';
export { default as visualizarFichaStyles } from './visualizarFichaStyles';

// Constantes de tema
export * from '../constants/Theme';

// Exemplo de uso:
// import { globalStyles, alunosStyles, COLORS, FONT_FAMILY } from '../styles';
