import { StyleSheet } from 'react-native';

const historicoStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#f44336',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  resumoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resumoCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resumoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  listaSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
  },
  treinoCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  treinoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  treinoData: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  treinoDuracao: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  treinoFicha: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 8,
  },
  treinoStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  treinoStatsText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  treinoExercicios: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  exercicioItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  medidasSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  medidaCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  medidaData: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 2,
  },
  medidaInfo: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 20,
  },
  detalhesButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  detalhesButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default historicoStyles;
