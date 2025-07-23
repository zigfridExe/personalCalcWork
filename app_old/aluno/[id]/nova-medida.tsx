import NovaMedidaScreen from '../../../src/domains/aluno/screens/NovaMedidaScreen';
export default NovaMedidaScreen;
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