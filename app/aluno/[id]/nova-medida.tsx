import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useAlunosStore from '../../../store/useAlunosStore';
import novaMedidaStyles from '../../../styles/novaMedidaStyles';

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
      // Calcular IMC (opcional, pode ser usado depois)
      const imc = pesoNum / Math.pow(alturaNum / 100, 2);
      await registrarMedida({
        aluno_id: Number(id),
        data,
        peso: pesoNum,
        altura: alturaNum,
        cintura: cinturaNum,
        quadril: quadrilNum,
        // imc não vai para a tabela, mas pode ser usado na tela
      });
      Alert.alert('Medida registrada com sucesso!');
      router.back();
    } catch (e) {
      Alert.alert('Erro ao registrar medida: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <View style={novaMedidaStyles.container}>
      <Text style={novaMedidaStyles.title}>Registrar Nova Medida</Text>
      <TextInput
        style={novaMedidaStyles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
      />
      <TextInput
        style={novaMedidaStyles.input}
        placeholder="Altura (cm)"
        keyboardType="numeric"
        value={altura}
        onChangeText={setAltura}
      />
      <TextInput
        style={novaMedidaStyles.input}
        placeholder="Cintura (cm)"
        keyboardType="numeric"
        value={cintura}
        onChangeText={setCintura}
      />
      <TextInput
        style={novaMedidaStyles.input}
        placeholder="Quadril (cm)"
        keyboardType="numeric"
        value={quadril}
        onChangeText={setQuadril}
      />
      <TextInput
        style={novaMedidaStyles.input}
        placeholder="Data da Medição (AAAA-MM-DD)"
        value={data}
        onChangeText={setData}
      />
      <Button title="Salvar" onPress={handleSalvar} color="#4CAF50" />
    </View>
  );
} 