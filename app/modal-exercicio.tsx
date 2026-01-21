import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text, View } from 'react-native';
import useExerciciosStore from '../store/useExerciciosStore';
import useAlunosStore from '../store/useAlunosStore';
import { exerciciosPorGrupo } from '../utils/exerciciosPorGrupo';
import { theme } from '@/styles/theme';
import SelectModal from '../components/SelectModal';

export default function ModalExercicioScreen() {
  const router = useRouter();
  const { fichaId, exercicioId } = useLocalSearchParams();
  const { exercicios, addExercicio, updateExercicio } = useExerciciosStore();
  const { initializeDatabase } = useAlunosStore();

  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [maquina, setMaquina] = useState('');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [carga, setCarga] = useState('');
  const [ajuste, setAjuste] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [descanso, setDescanso] = useState('');

  // Estados para o SelectModal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState<string[]>([]);
  const [currentSelectionKey, setCurrentSelectionKey] = useState<string | null>(null);

  const isEditing = !!exercicioId;

  // Dados para os selects
  const seriesOptions = ['1', '3', '4', '5'];
  const repeticoesOptions = ['6', '8', '10', '12', '15', 'Falha'];
  const cargaOptions = Array.from({ length: 40 }, (_, i) => `${(i + 1) * 1}`); // 1 a 40 (personalizável)
  const ajusteOptions = Array.from({ length: 15 }, (_, i) => `${i + 1}`);
  const descansoOptions = ['30', '45', '60', '90', '120'];

  useEffect(() => {
    const initDB = async () => {
      await initializeDatabase();
    };
    initDB();
  }, [initializeDatabase]);

  useEffect(() => {
    if (isEditing) {
      const exercicioToEdit = exercicios.find((e) => e.id.toString() === exercicioId);
      if (exercicioToEdit) {
        setNome(exercicioToEdit.nome || '');
        setGrupoMuscular(exercicioToEdit.grupo_muscular || '');
        setMaquina(exercicioToEdit.maquina || '');
        setSeries(exercicioToEdit.series || '');
        setRepeticoes(exercicioToEdit.repeticoes || '');
        setCarga(exercicioToEdit.carga || '');
        setAjuste(exercicioToEdit.ajuste || '');
        setObservacoes(exercicioToEdit.observacoes || '');
        setDescanso(exercicioToEdit.descanso || '');
      }
    }
  }, [isEditing, exercicioId, exercicios]);

  const handleSave = async () => {
    if (nome.trim().length === 0) {
      Alert.alert('Erro', 'Por favor, insira o nome do exercício.');
      return;
    }

    const exercicioData = {
      ficha_id: Number(fichaId),
      nome,
      grupo_muscular: grupoMuscular,
      maquina,
      series,
      repeticoes,
      carga,
      ajuste,
      observacoes,
      descanso,
    };

    if (isEditing) {
      await updateExercicio({ ...exercicioData, id: Number(exercicioId) });
    } else {
      await addExercicio(exercicioData);
    }
    router.back();
  };

  const openSelect = (key: string, title: string, options: string[]) => {
    setCurrentSelectionKey(key);
    setModalTitle(title);
    setModalOptions(options);
    setModalVisible(true);
  };

  const handleSelectConfirm = (value: string) => {
    switch (currentSelectionKey) {
      case 'nome': setNome(value); break;
      case 'series': setSeries(value); break;
      case 'repeticoes': setRepeticoes(value); break;
      case 'carga': setCarga(value); break;
      case 'ajuste': setAjuste(value); break;
      case 'descanso': setDescanso(value); break;
    }
    setModalVisible(false);
  };

  const gruposMusculares = [
    'Costas',
    'Peitoral',
    'Membros Inferiores',
    'Bíceps',
    'Tríceps',
    'Abdômen/Lombar',
    'Ombro',
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditing ? 'Editar Exercício' : 'Novo Exercício'}</Text>

        <Text style={styles.label}>TIPO:</Text>
        <View style={styles.gruposContainer}>
          {gruposMusculares.map((grupo) => (
            <TouchableOpacity
              key={grupo}
              style={[
                styles.grupoButton,
                grupoMuscular === grupo && styles.grupoButtonSelected,
              ]}
              onPress={() => {
                setGrupoMuscular(grupo);
                setNome(''); // Limpa o exercício ao mudar o grupo
              }}
            >
              <Text
                style={[
                  styles.grupoButtonText,
                  grupoMuscular === grupo && styles.grupoButtonTextSelected
                ]}
              >
                {grupo.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>EXERCÍCIO</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            if (!grupoMuscular) {
              Alert.alert('Atenção', 'Selecione o grupo muscular primeiro.');
              return;
            }
            openSelect('nome', 'Selecione o Exercício', exerciciosPorGrupo[grupoMuscular] || []);
          }}
        >
          <Text style={[styles.selectButtonText, !nome && styles.placeholderText]}>
            {nome ? nome.toUpperCase() : 'SELECIONE O EXERCÍCIO'}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="OU DIGITE O NOME DO EXERCÍCIO"
          placeholderTextColor={theme.colors.textSecondary}
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>EXECUÇÃO</Text>

        {/* Série */}
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>SÉRIE</Text>
          <TouchableOpacity
            style={styles.smallSelectButton}
            onPress={() => openSelect('series', 'Séries', seriesOptions)}
          >
            <Text style={styles.smallSelectText}>{series || '-'}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="DIGITE"
            placeholderTextColor={theme.colors.textSecondary}
            value={series}
            onChangeText={setSeries}
          />
        </View>

        {/* Repetição */}
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>REP.</Text>
          <TouchableOpacity
            style={styles.smallSelectButton}
            onPress={() => openSelect('repeticoes', 'Repetições', repeticoesOptions)}
          >
            <Text style={styles.smallSelectText}>{repeticoes || '-'}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="DIGITE"
            placeholderTextColor={theme.colors.textSecondary}
            value={repeticoes}
            onChangeText={setRepeticoes}
          />
        </View>

        {/* Carga */}
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>CARGA</Text>
          <TouchableOpacity
            style={styles.smallSelectButton}
            onPress={() => openSelect('carga', 'Carga (kg)', cargaOptions)}
          >
            <Text style={styles.smallSelectText}>{carga || '-'}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="DIGITE"
            placeholderTextColor={theme.colors.textSecondary}
            value={carga}
            onChangeText={setCarga}
            keyboardType="numeric"
          />
        </View>

        {/* Ajuste */}
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>AJUSTE</Text>
          <TouchableOpacity
            style={styles.smallSelectButton}
            onPress={() => openSelect('ajuste', 'Ajuste', ajusteOptions)}
          >
            <Text style={styles.smallSelectText}>{ajuste || '-'}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="DIGITE"
            placeholderTextColor={theme.colors.textSecondary}
            value={ajuste}
            onChangeText={setAjuste}
            keyboardType="numeric"
          />
        </View>

        {/* Descanso */}
        <View style={styles.execucaoRow}>
          <Text style={styles.execucaoLabel}>DESC.</Text>
          <TouchableOpacity
            style={styles.smallSelectButton}
            onPress={() => openSelect('descanso', 'Descanso (s)', descansoOptions)}
          >
            <Text style={styles.smallSelectText}>{descanso || '-'}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.execucaoInput, { marginLeft: 8 }]}
            placeholder="DIGITE"
            placeholderTextColor={theme.colors.textSecondary}
            value={descanso}
            onChangeText={setDescanso}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>SALVAR EXERCÍCIO</Text>
        </TouchableOpacity>
      </ScrollView>

      <SelectModal
        visible={modalVisible}
        title={modalTitle}
        options={modalOptions}
        onSelect={handleSelectConfirm}
        onClose={() => setModalVisible(false)}
        currentValue={
          currentSelectionKey === 'nome' ? nome :
            currentSelectionKey === 'series' ? series :
              currentSelectionKey === 'repeticoes' ? repeticoes :
                currentSelectionKey === 'carga' ? carga :
                  currentSelectionKey === 'ajuste' ? ajuste :
                    currentSelectionKey === 'descanso' ? descanso : ''
        }
      />

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.title,
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  // Inputs
  input: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: theme.fonts.regular,
  },
  // Select Buttons (Substitutos do Picker)
  selectButton: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10, // Adicionado margem
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  selectButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  chevron: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  // Small Select Button (para linhas de execução)
  smallSelectButton: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallSelectText: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.bold,
  },

  // Grupo Muscular Select
  gruposContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  grupoButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.card,
  },
  grupoButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  grupoButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  grupoButtonTextSelected: {
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    marginTop: 10,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Linhas de Execução
  execucaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  execucaoLabel: {
    width: 60,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    textTransform: 'uppercase',
  },
  execucaoInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: theme.fonts.regular,
  },

  // Botão Salvar
  saveButton: {
    backgroundColor: theme.colors.success,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  saveButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.title,
    fontSize: 18,
    textTransform: 'uppercase',
  },
});
