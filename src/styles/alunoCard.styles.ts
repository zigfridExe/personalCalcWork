import { StyleSheet } from 'react-native';

export const alunoCardStyles = StyleSheet.create({
  // Container principal do card
  container: {
    backgroundColor: '#1E1E1E', // Fundo escuro para combinar com o tema
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  
  // Linha de informações (imagem + detalhes)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Container das informações do aluno
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  
  // Nome do aluno
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texto branco para melhor contraste
    marginBottom: 6,
  },
  
  // Detalhes do aluno (nascimento, telefone)
  detalhe: {
    fontSize: 14,
    color: '#A0A0A0', // Cinza claro para detalhes
    marginBottom: 4,
  },
  
  // Container da imagem do aluno
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2A2A2A', // Fundo mais escuro para o placeholder
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFB700', // Borda amarela para combinar com o tema
  },
  
  // Imagem do aluno
  image: {
    width: '100%',
    height: '100%',
  },
  
  // Texto do placeholder da imagem
  placeholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFB700', // Amarelo para combinar com o tema
  },
  
  // Linha de botões
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  
  // Container do botão
  buttonContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2, // Sombra para dar profundidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  // Estilo base para os botões
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // Botão primário (amarelo com fundo)
  primaryButton: {
    backgroundColor: '#FFB700',
    borderColor: '#FFB700',
  },
  
  // Botão de perigo (vermelho com fundo)
  dangerButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  
  // Botão secundário (borda cinza escuro com fundo transparente)
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#333333',
  },
  
  // Estilo base para o texto dos botões
  buttonText: {
    fontFamily: 'Roboto',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  
  // Texto do botão primário
  primaryButtonText: {
    color: '#000000', // Texto preto para contraste com fundo amarelo
  },
  
  // Texto do botão de perigo
  dangerButtonText: {
    color: '#FFFFFF', // Texto branco para contraste com fundo vermelho
  },
  
  // Texto do botão secundário
  secondaryButtonText: {
    color: '#FFFFFF', // Texto branco para contraste com fundo escuro
  },
});

// Cores dos botões para reutilização
export const buttonColors = {
  primary: '#FFB700',     // Amarelo - Botão primário
  secondary: '#333333',   // Cinza escuro - Botão secundário com borda
  info: '#333333',        // Cinza escuro - Para informações
  warning: '#FFB700',     // Amarelo - Para avisos
  danger: '#FF3B30',      // Vermelho - Para ações perigosas
  default: '#333333',     // Cinza escuro - Padrão
};

export default alunoCardStyles;
