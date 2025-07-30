import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'RobotoCondensed-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#FFB700',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFB700',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
  },
  fichaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fichaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fichaTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#000',
    flex: 1,
  },
  fichaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 6,
  },
  smallIconButton: {
    padding: 4,
  },
  fichaDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fichaDetail: {
    fontSize: 14,
    fontFamily: 'SourceSansPro-Regular',
    color: '#666',
  },
  exerciciosSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#FFB700',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
  },
  exercicioContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exercicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exercicioTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#333',
    flex: 1,
  },
  exercicioActions: {
    flexDirection: 'row',
    gap: 4,
  },
  exercicioDetails: {
    gap: 8,
  },
  exercicioDetail: {
    fontSize: 14,
    fontFamily: 'SourceSansPro-Regular',
    color: '#666',
  },
  detailBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  detailBadgeText: {
    fontSize: 12,
    fontFamily: 'SourceSansPro-Regular',
    color: '#666',
  },
  detailLabel: {
    color: '#999',
    fontFamily: 'SourceSansPro-SemiBold',
  },
  ajusteContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  ajusteLabel: {
    fontSize: 12,
    fontFamily: 'SourceSansPro-SemiBold',
    color: '#999',
    marginBottom: 2,
  },
  ajusteText: {
    fontSize: 14,
    fontFamily: 'SourceSansPro-Regular',
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'SourceSansPro-Regular',
    color: '#999',
    textAlign: 'center',
  },
  emptyExercises: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyExercisesText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'SourceSansPro-Regular',
    color: '#999',
    textAlign: 'center',
  },
});

export default styles;
