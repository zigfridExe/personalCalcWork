import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAlunosStore from '../../../store/useAlunosStore';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { theme } from '@/styles/theme';

export default function ImcScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { alunos, registrarMedida } = useAlunosStore();
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState<number | null>(null);
  const [classificacao, setClassificacao] = useState('');

  useEffect(() => {
    // Não buscar peso/altura do cadastro do aluno, pois agora é histórico
    setPeso('');
    setAltura('');
    setImc(null);
    setClassificacao('');
  }, [id]);

  const calcularIMC = (pesoStr: string, alturaStr: string) => {
    const pesoNum = parseFloat(pesoStr.replace(',', '.'));
    const alturaNum = parseFloat(alturaStr.replace(',', '.')) / 100; // altura em metros
    if (!pesoNum || !alturaNum) {
      setImc(null);
      setClassificacao('');
      return;
    }
    const valorIMC = pesoNum / (alturaNum * alturaNum);
    setImc(valorIMC);
    setClassificacao(classificarIMC(valorIMC));
  };

  const classificarIMC = (valor: number) => {
    if (valor < 18.5) return 'Abaixo do peso';
    if (valor < 25) return 'Peso normal';
    if (valor < 30) return 'Sobrepeso';
    if (valor < 35) return 'Obesidade grau I';
    if (valor < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  };

  const handleCalcular = () => {
    calcularIMC(peso, altura);
  };

  return (
    <>
      <ScreenHeader title="Cálculo de IMC" />
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
        <Text style={styles.dica}>Digite a altura em centímetros. Exemplo: 175 para 1,75m</Text>

        <TouchableOpacity style={styles.button} onPress={handleCalcular}>
          <Text style={styles.buttonText}>CALCULAR IMC</Text>
        </TouchableOpacity>

        {imc && (
          <View style={styles.resultado}>
            <Text style={styles.imcValor}>IMC: {imc.toFixed(2)}</Text>
            <Text style={[styles.classificacao, {
              color: classificacao === 'Peso normal' ? theme.colors.success : theme.colors.warning
            }]}>
              {classificacao}
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
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
    marginBottom: 5,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: 16
  },
  resultado: {
    marginVertical: 30,
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  imcValor: {
    fontSize: 32,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
  },
  classificacao: {
    fontSize: 20,
    marginTop: 5,
    fontFamily: theme.fonts.regular
  },
  dica: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    alignSelf: 'flex-start',
    fontStyle: 'italic'
  },
  button: {
    width: '100%',
    backgroundColor: theme.colors.info,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: theme.colors.background,
    fontFamily: theme.fonts.title,
    fontSize: 16
  }
});
