import React, { useCallback, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAlunosStore from '../../store/useAlunosStore';
import avaliacaoStyles from '../../styles/avaliacaoStyles';

export default function AvaliacaoFisicaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { alunos, buscarMedidas } = useAlunosStore();
  const aluno = alunos.find((a) => a.id.toString() === id);
  const [historicoMedidas, setHistoricoMedidas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarMedidas = useCallback(async () => {
    if (id) {
      try {
        setCarregando(true);
        const medidas = await buscarMedidas(Number(id));
        setHistoricoMedidas(medidas);
      } catch (erro) {
        console.error('Erro ao carregar medidas:', erro);
      } finally {
        setCarregando(false);
      }
    }
  }, [id]);

  // Recarregar os dados sempre que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      carregarMedidas();
    }, [carregarMedidas])
  );

  // Última medida para exibir como atual
  const ultimaMedida = historicoMedidas.length > 0 ? historicoMedidas[0] : null;

  const calcularIMC = (peso: number, altura: number) => {
    if (!peso || !altura) return null;
    return peso / Math.pow(altura / 100, 2);
  };

  return (
    <ScrollView contentContainerStyle={avaliacaoStyles.container}>
      <Text style={avaliacaoStyles.title}>Avaliação Física</Text>
      {ultimaMedida && (
        <View style={avaliacaoStyles.infoBox}>
          <Text style={avaliacaoStyles.infoTitle}>Informações Atuais</Text>
          <Text style={avaliacaoStyles.infoItem}>Peso: {ultimaMedida.peso ? ultimaMedida.peso + ' kg' : '-'}</Text>
          <Text style={avaliacaoStyles.infoItem}>Altura: {ultimaMedida.altura ? ultimaMedida.altura + ' cm' : '-'}</Text>
          <Text style={avaliacaoStyles.infoItem}>IMC: {calcularIMC(ultimaMedida.peso, ultimaMedida.altura)?.toFixed(2) ?? '-'}</Text>
          {ultimaMedida.cintura && <Text style={avaliacaoStyles.infoItem}>Cintura: {ultimaMedida.cintura} cm</Text>}
          {ultimaMedida.quadril && <Text style={avaliacaoStyles.infoItem}>Quadril: {ultimaMedida.quadril} cm</Text>}
        </View>
      )}
      <View style={avaliacaoStyles.buttonRow}>
        <Button
          title="Registrar Nova Medida"
          onPress={() => router.push({ pathname: '/aluno/[id]/nova-medida', params: { id: id?.toString() } })}
          color="#4CAF50"
        />
        <View style={avaliacaoStyles.buttonSpacer} />
        <Button
          title="Calcular IMC"
          onPress={() => router.push({ pathname: '/aluno/[id]/imc', params: { id: id?.toString() } })}
          color="#2196F3"
        />
      </View>
      <View style={avaliacaoStyles.buttonRow}>
        <Button
          title="Atualizar Dados"
          onPress={carregarMedidas}
          color="#9C27B0"
        />
      </View>
      <Text style={avaliacaoStyles.sectionTitle}>Histórico de Medidas</Text>
      {carregando ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />
      ) : historicoMedidas.length === 0 ? (
        <Text style={avaliacaoStyles.emptyText}>Nenhum registro de medidas encontrado.</Text>
      ) : (
        historicoMedidas.map((medida, idx) => (
          <View key={idx} style={avaliacaoStyles.historicoItem}>
            <Text style={avaliacaoStyles.historicoData}>
            {new Date(medida.data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
            <Text style={avaliacaoStyles.historicoInfo}>Peso: {medida.peso} kg | Altura: {medida.altura} cm | IMC: {calcularIMC(medida.peso, medida.altura)?.toFixed(2)}</Text>
            {medida.cintura && <Text style={avaliacaoStyles.historicoInfo}>Cintura: {medida.cintura} cm</Text>}
            {medida.quadril && <Text style={avaliacaoStyles.historicoInfo}>Quadril: {medida.quadril} cm</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}
