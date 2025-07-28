import { StyleSheet } from 'react-native';

export const navigationStyles = StyleSheet.create({
  // Estilos para o container principal das abas
  tabBar: {
    backgroundColor: '#000000', // Fundo preto para a barra de navegação
    borderTopWidth: 0,
    elevation: 10,
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  
  // Estilo para o ícone ativo/inativo
  tabBarIcon: {
    marginBottom: -3,
  },
  
  // Estilo para o texto da aba
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  
  // Estilo para o header da navegação
  header: {
    backgroundColor: '#000000', // Fundo preto para o cabeçalho
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    elevation: 0,
    shadowOpacity: 0,
  },
  
  // Estilo para o título do header
  headerTitle: {
    color: '#FFFFFF', // Texto branco para o título
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Estilo para o container do conteúdo
  contentContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Fundo cinza escuro para o conteúdo
  },
});

export const tabBarOptions = {
  activeTintColor: '#FFB700', // Amarelo para itens ativos
  inactiveTintColor: '#888888', // Cinza para itens inativos
  style: {
    backgroundColor: '#000000',
    borderTopWidth: 0,
    elevation: 10,
  },
  labelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  tabStyle: {
    paddingVertical: 5,
  },
};

export default navigationStyles;
