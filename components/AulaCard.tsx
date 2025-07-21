import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface AulaCardProps {
  aula: any;
  onMarcarPresenca: (aula: any, presenca: number) => void;
  onApagar: (aula: any) => void;
}

const AulaCard: React.FC<AulaCardProps> = ({ aula, onMarcarPresenca, onApagar }) => {
  return (
    <View style={styles.aulaCard}>
      <Text style={styles.aulaHora}><Text style={{fontWeight:'bold'}}>Horário:</Text> {aula.hora_inicio} ({aula.duracao_minutos}min)</Text>
      <Text style={styles.aulaAluno}><Text style={{fontWeight:'bold'}}>Aluno:</Text> {aula.aluno_nome || 'Aluno'}</Text>
      <Text style={[styles.aulaTipo, {
        color:
          aula.tipo_aula === 'RECORRENTE_GERADA' ? '#1976D2' :
          aula.tipo_aula === 'AVULSA' ? '#4CAF50' :
          aula.tipo_aula === 'EXCECAO_HORARIO' ? '#FF9800' :
          aula.tipo_aula === 'EXCECAO_CANCELAMENTO' ? '#F44336' : '#888',
        fontWeight: 'bold'
      }]}
      >
        {aula.tipo_aula === 'RECORRENTE_GERADA' && 'Recorrente'}
        {aula.tipo_aula === 'AVULSA' && 'Avulsa'}
        {aula.tipo_aula === 'EXCECAO_HORARIO' && 'Exceção de Horário'}
        {aula.tipo_aula === 'EXCECAO_CANCELAMENTO' && 'Exceção de Cancelamento'}
      </Text>
      <Text style={styles.aulaStatus}><Text style={{fontWeight:'bold'}}>Status:</Text> {aula.presenca === 1 ? 'Presente' : aula.presenca === 2 ? 'Faltou' : aula.presenca === 3 ? 'Cancelada' : 'Agendada'}</Text>
      {aula.observacoes ? <Text style={styles.aulaObs}><Text style={{fontWeight:'bold'}}>Observações:</Text> {aula.observacoes}</Text> : null}
      <View style={styles.aulaButtons}>
        <Button title="Presença" color="#4CAF50" onPress={() => onMarcarPresenca(aula, 1)} />
        <Button title="Falta" color="#FF9800" onPress={() => onMarcarPresenca(aula, 2)} />
        <Button title="Cancelar" color="#F44336" onPress={() => onMarcarPresenca(aula, 3)} />
        <Button title="Apagar" color="#B71C1C" onPress={() => onApagar(aula)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  aulaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  aulaHora: {
    fontWeight: 'bold',
    color: '#1976D2',
    fontSize: 16,
  },
  aulaAluno: {
    fontSize: 15,
    color: '#333',
  },
  aulaTipo: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
  },
  aulaStatus: {
    fontSize: 13,
    color: '#4CAF50',
  },
  aulaObs: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  aulaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default AulaCard; 