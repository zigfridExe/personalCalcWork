import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface AulaCardProps {
  aula: any;
  onMarcarPresenca: (aula: any, presenca: number) => void; // 1=Presente, 2=Falta
  onApagar: (aula: any) => void; // Cancelar/Excluir
  onReativar?: (aula: any) => void;
}

const AulaCard: React.FC<AulaCardProps> = ({ aula, onMarcarPresenca, onApagar, onReativar }) => {
  const router = useRouter();

  const handleCardPress = () => {
    if (aula.aluno_id) {
      router.push(`/aluno/${aula.aluno_id}` as any);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
      <View style={styles.aulaCard}>
        <View style={styles.headerRow}>
          <Text style={styles.aulaHora}>
            <Ionicons name="time-outline" size={16} color={theme.colors.primary} /> {aula.hora_inicio}
            <Text style={styles.duracao}> ({aula.duracao_minutos} min)</Text>
          </Text>
          <Text style={[styles.aulaTipo, {
            color:
              aula.tipo_aula === 'RECORRENTE_GERADA' ? theme.colors.info :
                aula.tipo_aula === 'AVULSA' ? theme.colors.success :
                  aula.tipo_aula === 'EXCECAO_HORARIO' ? theme.colors.warning :
                    aula.tipo_aula === 'EXCECAO_CANCELAMENTO' ? theme.colors.danger : theme.colors.textSecondary
          }]}>
            {aula.tipo_aula === 'RECORRENTE_GERADA' && 'Recorrente'}
            {aula.tipo_aula === 'AVULSA' && 'Avulsa'}
            {aula.tipo_aula === 'EXCECAO_HORARIO' && 'Exceção'}
            {aula.tipo_aula === 'EXCECAO_CANCELAMENTO' && 'Cancelada'}
          </Text>
        </View>

        <Text style={styles.aulaAluno}>
          {aula.aluno_nome || `Aluno #${aula.aluno_id}`}
        </Text>

        <View style={styles.statusRow}>
          <Text style={styles.labelStatus}>Status: </Text>
          <Text style={[styles.statusValue, {
            color: aula.presenca === 1 ? theme.colors.success :
              aula.presenca === 2 ? theme.colors.textSecondary :
                aula.presenca === 3 ? theme.colors.danger : theme.colors.primary
          }]}>
            {aula.presenca === 1 ? 'Presente' : aula.presenca === 2 ? 'Faltou' : aula.presenca === 3 ? 'Cancelada' : 'Agendada'}
          </Text>
        </View>

        {aula.observacoes ? (
          <Text style={styles.aulaObs}>
            <Text style={{ fontWeight: 'bold' }}>Obs:</Text> {aula.observacoes}
          </Text>
        ) : null}

        <View style={styles.separator} />

        <View style={styles.aulaButtons}>
          {aula.presenca === 0 ? (
            <>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.success }]} onPress={() => onMarcarPresenca(aula, 1)}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Presença</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.warning }]} onPress={() => onMarcarPresenca(aula, 2)}>
                <Ionicons name="close-circle-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Falta</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.info }]} onPress={() => onReativar && onReativar(aula)}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Reativar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#607D8B', marginRight: 0 }]}
            onPress={() => router.push(`/aluno/${aula.aluno_id}/fichas`)}
          >
            <Ionicons name="newspaper-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Fichas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.danger, opacity: aula.presenca === 3 ? 0.4 : 1 }]}
            onPress={() => {
              if (aula.presenca !== 3) onApagar(aula);
            }}
            activeOpacity={aula.presenca === 3 ? 1 : 0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>{aula.presenca === 3 ? 'Cancelada' : 'Cancelar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  aulaCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 4, // Ajustado para não ficar muito estreito
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aulaHora: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontSize: 16,
  },
  duracao: {
    fontSize: 12,
    fontWeight: 'normal',
    color: theme.colors.textSecondary,
  },
  aulaAluno: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 8,
  },
  aulaTipo: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelStatus: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: theme.fonts.secondary,
  },
  aulaObs: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  aulaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  }
});

export default AulaCard; 