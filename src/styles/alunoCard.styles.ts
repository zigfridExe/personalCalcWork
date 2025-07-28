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
  },
  
  // Container do botão
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  // Estilo base para os botões
  button: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Estilo para o texto dos botões
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

// Cores dos botões para reutilização
export const buttonColors = {
  primary: '#FFB700',     // Amarelo
  secondary: '#4CAF50',   // Verde
  info: '#2196F3',       // Azul
  warning: '#FF9800',    // Laranja
  danger: '#F44336',     // Vermelho
  default: '#607D8B',    // Azul acinzentado
};

export default alunoCardStyles;
