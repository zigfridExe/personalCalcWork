import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAlunosStore from '../../../store/useAlunosStore';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Avaliação Física</Text>
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
        <Button
          title="Registrar Nova Medida"
          onPress={() => router.push({ pathname: '/aluno/[id]/nova-medida', params: { id } })}
          color="#4CAF50"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Calcular IMC"
          onPress={() => router.push({ pathname: '/aluno/[id]/imc', params: { id } })}
          color="#2196F3"
        />
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
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2196F3',
  },
  infoItem: {
    fontSize: 15,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 20,
  },
  historicoItem: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  historicoData: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 2,
  },
  historicoInfo: {
    fontSize: 14,
    color: '#333',
  },
}); 