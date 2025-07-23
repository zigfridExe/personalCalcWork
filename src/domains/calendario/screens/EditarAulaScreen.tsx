import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Switch, Alert, TouchableOpacity, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAulasStore from '../store/useAulasStore';
import useAlunosStore from '../store/useAlunosStore';
import { Picker } from '@react-native-picker/picker';
import editarAulaStyles from '../styles/editarAulaStyles';

export default function EditarAulaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { aulas, editarAula } = useAulasStore();
  const { alunos } = useAlunosStore();
  const aula = aulas.find(a => a.id === Number(id));

  const [alunoId, setAlunoId] = useState<number | null>(aula?.aluno_id || alunos[0]?.id || null);
  const [data, setData] = useState(aula?.data_aula || '');
  const [hora, setHora] = useState(aula?.hora_inicio || '');
  const [duracao, setDuracao] = useState(aula?.duracao_minutos ? String(aula.duracao_minutos) : '60');
  const [descricao, setDescricao] = useState(aula?.observacoes || '');
  const [presenca, setPresenca] = useState(aula?.presenca === 1);
  const [tipoAula, setTipoAula] = useState<'RECORRENTE_GERADA' | 'AVULSA' | 'EXCECAO_HORARIO' | 'EXCECAO_CANCELAMENTO'>(aula?.tipo_aula as any || 'AVULSA');

  useEffect(() => {
    if (aula) {
      setAlunoId(aula.aluno_id);
      setData(aula.data_aula);
      setHora(aula.hora_inicio);
      setDuracao(String(aula.duracao_minutos));
      setDescricao(aula.observacoes || '');
      setPresenca(aula.presenca === 1);
      setTipoAula(aula.tipo_aula);
    }
  }, [aula]);

  // ...funções auxiliares e UI conforme original...

  return (
    <View style={editarAulaStyles.container}>
      <Text>Editar Aula</Text>
      {/* ...UI do formulário... */}
    </View>
  );
}
