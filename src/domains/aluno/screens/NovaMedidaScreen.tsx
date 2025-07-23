import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAlunosStore from '../../store/useAlunosStore';
import novaMedidaStyles from '../../styles/novaMedidaStyles';
import KeyboardAwareScrollView from '../../components/KeyboardAwareScrollView';

interface InputRefs {
  altura: TextInput | null;
  cintura: TextInput | null;
  quadril: TextInput | null;
  data: TextInput | null;
}

export default function NovaMedidaScreen() {
  const inputRefs = useRef<InputRefs>({
    altura: null,
    cintura: null,
    quadril: null,
    data: null
  });
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
        quadril: quadrilNum
      });
      Alert.alert('Medida registrada com sucesso!');
      router.back();
    } catch (e) {
      Alert.alert('Erro ao registrar medida: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  // Função para formatar número com vírgula como separador decimal
  const formatNumberInput = (text: string, setter: (value: string) => void) => {
    // Substitui vírgula por ponto para cálculo interno
    const formatted = text.replace(',', '.');
    // Verifica se o valor é um número válido ou está vazio
    if (formatted === '' || !isNaN(Number(formatted))) {
      // Mantém a vírgula para exibição se o usuário digitar
      setter(text);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAwareScrollView 
        style={novaMedidaStyles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={novaMedidaStyles.title}>Registrar Nova Medida</Text>
        
        <TextInput
          style={novaMedidaStyles.input}
          placeholder="Peso (kg)"
          keyboardType="numeric"
          value={peso}
          onChangeText={(text) => formatNumberInput(text, setPeso)}
          returnKeyType="next"
          onSubmitEditing={() => {
            // Foca no próximo campo
            inputRefs.current.altura?.focus();
          }}
        />
        
        <TextInput
          ref={ref => { inputRefs.current.altura = ref; }}
          style={novaMedidaStyles.input}
          placeholder="Altura (cm)"
          keyboardType="numeric"
          value={altura}
          onChangeText={(text) => formatNumberInput(text, setAltura)}
          returnKeyType="next"
          onSubmitEditing={() => {
            inputRefs.current.cintura?.focus();
          }}
        />
        
        <TextInput
          ref={ref => { inputRefs.current.cintura = ref; }}
          style={novaMedidaStyles.input}
          placeholder="Cintura (cm) - Opcional"
          keyboardType="numeric"
          value={cintura}
          onChangeText={(text) => formatNumberInput(text, setCintura)}
          returnKeyType="next"
          onSubmitEditing={() => {
            inputRefs.current.quadril?.focus();
          }}
        />
        
        <TextInput
          ref={ref => { inputRefs.current.quadril = ref; }}
          style={novaMedidaStyles.input}
          placeholder="Quadril (cm) - Opcional"
          keyboardType="numeric"
          value={quadril}
          onChangeText={(text) => formatNumberInput(text, setQuadril)}
          returnKeyType="next"
          onSubmitEditing={() => {
            inputRefs.current.data?.focus();
          }}
        />
        
        <TextInput
          ref={ref => { inputRefs.current.data = ref; }}
          style={novaMedidaStyles.input}
          placeholder="Data da Medição (AAAA-MM-DD)"
          value={data}
          onChangeText={setData}
          returnKeyType="done"
          onSubmitEditing={handleSalvar}
        />
        
        <View style={{ marginTop: 20 }}>
          <Button title="Salvar Medida" onPress={handleSalvar} color="#4CAF50" />
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}
