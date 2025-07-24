import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, differenceInYears, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import alunosStyles from '../../../styles/alunosStyles';

interface AlunoCardProps {
  aluno: {
    id: number;
    nome: string;
    fotoUri?: string;
    data_nascimento?: string;
    contato?: string;
  };
  onDelete: (id: number) => void;
}

function formatarTelefone(telefone: string) {
  if (!telefone) return '';
  let v = telefone.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) {
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  } else if (v.length > 2) {
    return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    return v;
  }
}

function calcularIdade(dataNascimento?: string): string {
  if (!dataNascimento) return '';
  
  try {
    // Tenta converter a data para o formato Date
    let data: Date;
    
    if (dataNascimento.includes('/')) {
      // Formato DD/MM/YYYY
      const [day, month, year] = dataNascimento.split('/').map(Number);
      data = new Date(year, month - 1, day);
    } else if (dataNascimento.includes('-')) {
      // Formato YYYY-MM-DD
      data = parseISO(dataNascimento);
    } else {
      return '';
    }
    
    // Verifica se a data é válida
    if (isNaN(data.getTime())) return '';
    
    const idade = differenceInYears(new Date(), data);
    return `${idade} ${idade === 1 ? 'ano' : 'anos'}`;
  } catch (error) {
    console.error('Erro ao calcular idade:', error);
    return '';
  }
}

type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  textStyle?: any;
  isDelete?: boolean;
  disabled?: boolean;
};

const CustomButton = ({ onPress, children, style, textStyle, isDelete = false, disabled = false }: ButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const buttonStyles = [
    alunosStyles.button,
    isPressed && (isDelete ? alunosStyles.deleteButtonPressed : alunosStyles.buttonPressed),
    disabled && alunosStyles.buttonDisabled,
    isDelete && alunosStyles.deleteButton,
    style
  ];
  
  const textStyles = [
    isDelete ? alunosStyles.deleteButtonText : alunosStyles.buttonText,
    isPressed && (isDelete ? {} : alunosStyles.buttonTextPressed),
    disabled && alunosStyles.buttonTextDisabled,
    textStyle
  ];
  
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      style={buttonStyles}
    >
      <Text style={textStyles}>
        {children}
      </Text>
    </Pressable>
  );
};

export default function AlunoCard({ aluno, onDelete }: AlunoCardProps) {
  const navigation = useNavigation();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleEdit = () => {
    // Navega para a tela de edição do aluno
    // @ts-ignore - A tipagem do navigation será ajustada posteriormente
    navigation.navigate('EditAluno', { alunoId: aluno.id });
  };
  
  const handleDeletePress = () => {
    setIsDeleting(true);
    onDelete(aluno.id);
    // Resetar o estado após um curto atraso para evitar múltiplos cliques
    setTimeout(() => setIsDeleting(false), 1000);
  };
  
  // Extrair a primeira letra do nome para o avatar
  const primeiraLetra = aluno.nome ? aluno.nome.charAt(0).toUpperCase() : '?';
  
  // Formatar telefone
  const telefoneFormatado = aluno.contato ? formatarTelefone(aluno.contato) : 'Sem contato';
  
  // Calcular idade
  const idade = calcularIdade(aluno.data_nascimento);
  
  return (
    <View style={alunosStyles.card}>
      <View style={alunosStyles.cardContent}>
        {aluno.fotoUri ? (
          <Image 
            source={{ uri: aluno.fotoUri }} 
            style={alunosStyles.profileImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={alunosStyles.profileInitialContainer}>
            <Text style={alunosStyles.profileInitialText}>{primeiraLetra}</Text>
          </View>
        )}
        
        <View style={alunosStyles.infoContainer}>
          <Text style={alunosStyles.studentName}>{aluno.nome}</Text>
          <Text style={alunosStyles.infoText}>{telefoneFormatado}</Text>
          {idade ? <Text style={alunosStyles.infoText}>{idade}</Text> : null}
        </View>
      </View>
      
      <View style={alunosStyles.buttonsContainer}>
        <View style={alunosStyles.buttonRow}>
          <CustomButton 
            onPress={handleEdit}
            style={{ flex: 1, marginRight: 4 }}
          >
            Editar
          </CustomButton>
          
          <CustomButton 
            onPress={handleDeletePress}
            isDelete
            disabled={isDeleting}
            style={{ flex: 1, marginLeft: 4 }}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </CustomButton>
        </View>
      </View>
    </View>
  );
}
