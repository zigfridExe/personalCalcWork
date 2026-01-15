
import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.primary,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  fichaContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fichaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fichaTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
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
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textSecondary,
  },
  exerciciosSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
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
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    fontWeight: 'bold',
  },
  exercicioContainer: {
    backgroundColor: '#2A2A2A', // Um pouco mais claro que o card
    borderRadius: theme.borderRadius.sm,
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
    fontFamily: theme.fonts.regular,
    fontWeight: 'bold',
    color: theme.colors.text,
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
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textSecondary,
  },
  detailBadge: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailBadgeText: {
    fontSize: 12,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textSecondary,
  },
  detailLabel: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.regular,
    fontWeight: 'bold',
  },
  ajusteContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  ajusteLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  ajusteText: {
    fontSize: 14,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyExercises: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border, // Dashed border not supported directly like CSS, keeping simple
  },
  emptyExercisesText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: theme.fonts.secondary,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default styles;
