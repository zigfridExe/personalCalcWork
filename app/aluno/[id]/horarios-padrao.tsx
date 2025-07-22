import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function HorariosPadrao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text>Horários Padrão do Aluno ID: {id}</Text>
      {/* Implementar a lógica de horários padrão aqui */}
    </View>
  );
}