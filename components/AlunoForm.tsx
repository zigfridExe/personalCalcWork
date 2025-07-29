import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  useColorScheme 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles } from '@/styles/alunoForm.styles';

interface AlunoFormProps {
  initialValues?: {
    nome: string;
    telefone: string;
    dataNascimento: string;
    fotoUri?: string | null;
  };
  onSubmit: (data: { nome: string; telefone: string; dataNascimento: string; fotoUri: string | null }) => void;
  submitLabel?: string;
}

export default function AlunoForm({ initialValues, onSubmit, submitLabel = 'Salvar' }: AlunoFormProps) {
  const [nome, setNome] = useState(initialValues?.nome || '');
  const [telefone, setTelefone] = useState(initialValues?.telefone || '');
  const [dataNascimento, setDataNascimento] = useState(initialValues?.dataNascimento || '');
  const [fotoUri, setFotoUri] = useState<string | null>(initialValues?.fotoUri || null);

  useEffect(() => {
    if (initialValues) {
      setNome(initialValues.nome || '');
      setTelefone(initialValues.telefone || '');
      setDataNascimento(initialValues.dataNascimento || '');
      setFotoUri(initialValues.fotoUri || null);
    }
  }, [initialValues]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setFotoUri(null);
  };

  // Função para aplicar máscara de data DD/MM/AAAA
  function maskDate(value: string) {
    // Remove tudo que não for número
    let v = value.replace(/\D/g, '');
    // Limita a 8 dígitos
    v = v.slice(0, 8);
    // Adiciona as barras
    if (v.length > 4) {
      v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    } else if (v.length > 2) {
      v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }
    return v;
  }

  // Função para validar data no formato DD/MM/AAAA
  function isDataValidaBR(data: string) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
    const [d, m, y] = data.split('/');
    const date = new Date(`${y}-${m}-${d}`);
    return !isNaN(date.getTime()) && Number(d) > 0 && Number(m) > 0 && Number(m) <= 12 && Number(y) > 1900;
  }

  // Função para aplicar máscara de telefone
  function maskPhone(value: string) {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      // Celular: (XX) XXXXX-XXXX
      return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else if (v.length > 2) {
      // Fixo: (XX) XXXX-XXXX
      return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      return v;
    }
  }

  // Função para validar telefone
  function isTelefoneValido(telefone: string) {
    const v = telefone.replace(/\D/g, '');
    return v.length === 10 || v.length === 11;
  }

  const handleSubmit = () => {
    if (!nome.trim() || !telefone.trim() || !dataNascimento.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (!isDataValidaBR(dataNascimento)) {
      alert('Data de nascimento inválida! Use o formato DD/MM/AAAA.');
      return;
    }
    if (!isTelefoneValido(telefone)) {
      alert('Telefone inválido! Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.');
      return;
    }
    // Salvar só os números no banco
    const telefoneNumeros = telefone.replace(/\D/g, '');
    onSubmit({ nome, telefone: telefoneNumeros, dataNascimento, fotoUri });
  };

  const colorScheme = useColorScheme() || 'dark'; // Padrão para tema escuro

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados do Aluno</Text>
      
      <View style={styles.imageContainer}>
        {fotoUri ? (
          <Image 
            source={{ uri: fotoUri }} 
            style={styles.imagePreview}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {nome ? nome.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.photoButtons}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={pickImage}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>📷 Selecionar Foto</Text>
        </TouchableOpacity>
        
        {fotoUri && (
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: '#f44336' }]}
            onPress={handleRemovePhoto}
          >
            <Text style={[styles.buttonText, { color: '#f44336' }]}>🗑️ Remover</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={[styles.input, styles.textInput]}
        placeholder="Nome do Aluno"
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={[styles.input, styles.textInput]}
        placeholder="Telefone"
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={maskPhone(telefone)}
        onChangeText={text => setTelefone(maskPhone(text))}
        keyboardType="phone-pad"
      />

      <TextInput
        style={[styles.input, styles.textInput, styles.lastInput]}
        placeholder="Data de Nascimento (DD/MM/AAAA)"
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={dataNascimento}
        onChangeText={text => setDataNascimento(maskDate(text))}
        keyboardType="number-pad"
      />

      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}