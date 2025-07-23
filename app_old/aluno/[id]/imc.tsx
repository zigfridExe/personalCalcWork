import ImcScreen from '../../../src/domains/aluno/screens/ImcScreen';
export default ImcScreen;  const handleCalcular = () => {
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
    <View style={imcStyles.container}>
      <Text style={imcStyles.title}>Cálculo de IMC</Text>
      <TextInput
        style={imcStyles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
      />
      <TextInput
        style={imcStyles.input}
        placeholder="Altura (cm)"
        keyboardType="numeric"
        value={altura}
        onChangeText={setAltura}
      />
      <Text style={imcStyles.dica}>Digite a altura em centímetros. Exemplo: 175 para 1,75m</Text>
      <Button title="Calcular IMC" onPress={handleCalcular} />
      {imc && (
        <View style={imcStyles.resultado}>
          <Text style={imcStyles.imcValor}>IMC: {imc.toFixed(2)}</Text>
          <Text style={imcStyles.classificacao}>{classificacao}</Text>
        </View>
      )}
      {/* Removido o botão de salvar, pois o registro deve ser feito na avaliação física completa */}
    </View>
  );
} 