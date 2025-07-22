import { StyleSheet } from 'react-native';

const fichasStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    width: '100%',
    marginTop: 20,
  },
  fichaContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  fichaItem: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fichaDetail: {
    fontSize: 14,
    color: 'gray',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  exercicioContainer: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginVertical: 4,
  },
  exercicioItem: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exercicioDetail: {
    fontSize: 14,
    color: 'gray',
  },
});

export default fichasStyles;
