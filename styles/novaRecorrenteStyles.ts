import { StyleSheet } from 'react-native';

const novaRecorrenteStyles = StyleSheet.create({
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
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
  },
  input: {
    width: '95%',
    height: 48,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    fontSize: 16,
  },
  pickerWrapper: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
  },
  picker: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  pickerItem: {
    fontSize: 18,
    height: 48,
    textAlign: 'left',
  },
  diasSemanaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 15,
    width: '95%',
  },
  diaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginHorizontal: 2,
  },
  diaBtnAtivo: {
    backgroundColor: '#1976D2',
  },
  diaBtnTextAtivo: {
    color: '#fff',
  },
  diaBtnTextInativo: {},
  alunoDisplay: {
    width: '95%',
    minHeight: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alunoNome: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
});

export default novaRecorrenteStyles;
