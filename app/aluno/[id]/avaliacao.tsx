import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAlunosStore from '../../../store/useAlunosStore';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme } from '@/styles/theme';

export default function AvaliacaoFisicaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { alunos, buscarMedidas } = useAlunosStore();
  const aluno = alunos.find((a) => a.id.toString() === id);
  const [historicoMedidas, setHistoricoMedidas] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      buscarMedidas(Number(id)).then(setHistoricoMedidas);
    }
  }, [id]);

  // Última medida para exibir como atual
  const ultimaMedida = historicoMedidas.length > 0 ? historicoMedidas[0] : null;

  const calcularIMC = (peso: number, altura: number) => {
    if (!peso || !altura) return null;
    return peso / Math.pow(altura / 100, 2);
  };

  return (
    <>
      <ScreenHeader title="Avaliação Física" />
      <ScrollView contentContainerStyle={styles.container}>
        {ultimaMedida && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Informações Atuais</Text>
            <Text style={styles.infoItem}>Peso: {ultimaMedida.peso ? ultimaMedida.peso + ' kg' : '-'}</Text>
            <Text style={styles.infoItem}>Altura: {ultimaMedida.altura ? ultimaMedida.altura + ' cm' : '-'}</Text>
            <Text style={styles.infoItem}>IMC: {calcularIMC(ultimaMedida.peso, ultimaMedida.altura)?.toFixed(2) ?? '-'}</Text>
            {ultimaMedida.cintura && <Text style={styles.infoItem}>Cintura: {ultimaMedida.cintura} cm</Text>}
            {ultimaMedida.quadril && <Text style={styles.infoItem}>Quadril: {ultimaMedida.quadril} cm</Text>}
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.success }]}
            onPress={() => router.push({ pathname: '/aluno/[id]/nova-medida', params: { id: Array.isArray(id) ? id[0] : id } })}
          >
            <Text style={styles.buttonText}>Registrar Nova Medida</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.info }]}
            onPress={() => router.push({ pathname: '/aluno/[id]/imc', params: { id: Array.isArray(id) ? id[0] : id } })}
          >
            <Text style={styles.buttonText}>Calcular IMC</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Histórico de Medidas</Text>
        {historicoMedidas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum registro de medidas encontrado.</Text>
        ) : (
          historicoMedidas.map((medida, idx) => (
            <View key={idx} style={styles.historicoItem}>
              <Text style={styles.historicoData}>{medida.data}</Text>
              <Text style={styles.historicoInfo}>Peso: {medida.peso} kg | Altura: {medida.altura} cm | IMC: {calcularIMC(medida.peso, medida.altura)?.toFixed(2)}</Text>
              {medida.cintura && <Text style={styles.historicoInfo}>Cintura: {medida.cintura} cm</Text>}
              {medida.quadril && <Text style={styles.historicoInfo}>Quadril: {medida.quadril} cm</Text>}
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
    alignItems: 'center'
  },
  infoBox: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    marginBottom: 10,
    color: theme.colors.primary,
  },
  infoItem: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    marginBottom: 4,
    color: theme.colors.text
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 10
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
    fontSize: 14,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.title,
    marginBottom: 10,
    color: theme.colors.primary,
    alignSelf: 'flex-start',
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    fontFamily: theme.fonts.regular,
    fontStyle: 'italic'
  },
  historicoItem: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  historicoData: {
    fontFamily: theme.fonts.title,
    color: theme.colors.text,
    marginBottom: 4,
    fontSize: 16
  },
  historicoInfo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular
  },
});
