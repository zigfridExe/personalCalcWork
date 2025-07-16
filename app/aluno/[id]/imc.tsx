import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAlunosStore from '../../../store/useAlunosStore';

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

  const handleSalvar = async () => {
    if (!peso || !altura || !imc) {
      Alert.alert('Preencha peso e altura corretamente!');
      return;
    }
    try {
      const aluno = alunos.find((a) => a.id.toString() === id);
      if (!aluno) throw new Error('Aluno não encontrado');
      await registrarMedida({
        aluno_id: aluno.id,
        data: new Date(),
        peso: parseFloat(peso.replace(',', '.')),
        altura: parseFloat(altura.replace(',', '.')),
      });
      Alert.alert('Avaliação física salva com sucesso!');
      router.back();
    } catch (e) {
      Alert.alert('Erro ao salvar avaliação: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cálculo de IMC</Text>
      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
      />
      <TextInput
        style={styles.input}
        placeholder="Altura (cm)"
        keyboardType="numeric"
        value={altura}
        onChangeText={setAltura}
      />
      <Text style={styles.dica}>Digite a altura em centímetros. Exemplo: 175 para 1,75m</Text>
      <Button title="Calcular IMC" onPress={handleCalcular} />
      {imc && (
        <View style={styles.resultado}>
          <Text style={styles.imcValor}>IMC: {imc.toFixed(2)}</Text>
          <Text style={styles.classificacao}>{classificacao}</Text>
        </View>
      )}
      {/* Removido o botão de salvar, pois o registro deve ser feito na avaliação física completa */}
    </View>
  );
}

const styles = StyleSheet.create({
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
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  resultado: {
    marginVertical: 20,
    alignItems: 'center',
  },
  imcValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  classificacao: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  dica: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
}); 