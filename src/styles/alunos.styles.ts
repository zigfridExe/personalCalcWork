import { StyleSheet } from 'react-native';

export const alunosStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fundo escuro
    paddingTop: 16,
  },
  
  // Container do conteúdo que pode rolar
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Lista de alunos
  list: {
    width: '100%',
    paddingHorizontal: 16,
  },
  
  // Botão de cadastrar novo aluno
  cadastrarButton: {
    backgroundColor: '#FFB700', // Amarelo conforme o padrão
    padding: 16,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  
  // Texto do botão de cadastrar
  cadastrarButtonText: {
    color: '#000', // Preto para contraste com o fundo amarelo
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto-Medium',
  },
  
  // Mensagem quando não há alunos cadastrados
  emptyMessage: {
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    paddingHorizontal: 32,
  },
  
  // Container do botão flutuante (se necessário no futuro)
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    elevation: 8,
  },
});

// Cores para referência
const colors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FFB700',
  onPrimary: '#000000',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
};

export default alunosStyles;
