import { StyleSheet } from 'react-native';

const novaAulaStyles = StyleSheet.create({
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
  selectAluno: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  tipoBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  tipoBtnAtivo: {
    backgroundColor: '#1976D2',
  },
  tipoBtnTextAtivo: {
    color: '#fff',
  },
  tipoBtnTextInativo: {},
  tipoBtnContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '80%',
    justifyContent: 'center',
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
  diasSemanaContainer: {
    marginBottom: 15,
    width: '80%',
  },
  diasSemanaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
});

export default novaAulaStyles;
