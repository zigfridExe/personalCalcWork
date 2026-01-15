import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAlunosStore from '../../../store/useAlunosStore';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme } from '@/styles/theme';

export default function NovaMedidaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { registrarMedida } = useAlunosStore();
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [cintura, setCintura] = useState('');
  const [quadril, setQuadril] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  const handleSalvar = async () => {
    if (!peso || !altura) {
      Alert.alert('Preencha pelo menos peso e altura!');
      return;
    }
    try {
      const pesoNum = parseFloat(peso.replace(',', '.'));
      const alturaNum = parseFloat(altura.replace(',', '.'));
      const cinturaNum = cintura ? parseFloat(cintura.replace(',', '.')) : null;
      const quadrilNum = quadril ? parseFloat(quadril.replace(',', '.')) : null;

      await registrarMedida({
        aluno_id: Number(id),
        data: new Date(data),
        peso: pesoNum,
        altura: alturaNum,
        cintura: cinturaNum,
        quadril: quadrilNum,
      });
      Alert.alert('Medida registrada com sucesso!');
      router.back();
    } catch (e) {
      Alert.alert('Erro ao registrar medida: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <>
      <ScreenHeader title="Nova Medida" />
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 70"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          value={peso}
          onChangeText={setPeso}
        />

        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 175"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
        />

        <Text style={styles.label}>Cintura (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Opcional"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          value={cintura}
          onChangeText={setCintura}
        />

        <Text style={styles.label}>Quadril (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Opcional"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          value={quadril}
          onChangeText={setQuadril}
        />

        <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={theme.colors.textSecondary}
          value={data}
          onChangeText={setData}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>SALVAR MEDIDAS</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center'
  },
  label: {
    alignSelf: 'flex-start',
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    marginBottom: 5,
    marginTop: 10
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 16
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    width: '100%',
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    fontSize: 18,
    textTransform: 'uppercase',
  }
});
