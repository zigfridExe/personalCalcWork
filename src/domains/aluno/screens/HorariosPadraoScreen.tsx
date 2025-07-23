import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function HorariosPadrao() {
  const route = useRoute();
  const { id } = (route as any).params || {};
  
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text>Horários Padrão do Aluno ID: {id}</Text>
      {/* Implementar a lógica de horários padrão aqui */}
    </View>
  );
}
