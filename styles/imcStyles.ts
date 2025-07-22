import { StyleSheet } from 'react-native';

const imcStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  resultado: {
    marginVertical: 20,
    alignItems: 'center',
  },
  imcValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  classificacao: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  dica: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default imcStyles;
