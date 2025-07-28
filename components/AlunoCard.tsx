import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { alunoCardStyles as styles, buttonColors } from '@/styles/alunoCard.styles';

interface AlunoCardProps {
  aluno: {
    id: number;
    nome: string;
    contato?: string;
    data_nascimento?: string;
    fotoUri?: string;
  };
  onDelete: (id: number) => void;
}

// Usando useRouter para navegação programática
// Isso evita problemas de tipagem com o componente Link

// Função para formatar telefone
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

const AlunoCard: React.FC<AlunoCardProps> = ({ aluno, onDelete }) => {
  const handleDelete = () => {
    onDelete(aluno.id);
  };

  const router = useRouter();
  
  // Função para lidar com a navegação
  const handleNavigation = (path: string) => {
    router.push(path as any); // Usando 'as any' temporariamente para evitar erros de tipagem
  };

  // Função para renderizar botões de ação
  const renderActionButton = ({
    href,
    label,
    color,
    onPress,
  }: {
    href?: string;
    label: string;
    color: string;
    onPress?: () => void;
  }) => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: color }]}
        onPress={href ? () => handleNavigation(href) : onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <View style={styles.imageContainer}>
          {aluno.fotoUri ? (
            <Image 
              source={{ uri: aluno.fotoUri }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.placeholderText}>
              {aluno.nome.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.nome} numberOfLines={1} ellipsizeMode="tail">
            {aluno.nome}
          </Text>
          
          {aluno.data_nascimento && (
            <Text style={styles.detalhe}>
              Nascimento: {aluno.data_nascimento.length === 10 
                ? aluno.data_nascimento 
                : format(new Date(aluno.data_nascimento.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')), 'dd/MM/yyyy')}
            </Text>
          )}
          
          {aluno.contato && (
            <Text style={styles.detalhe}>
              Telefone: {formatarTelefone(aluno.contato)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.buttonsRow}>
        {renderActionButton({
          href: `/aluno/${aluno.id}/fichas`,
          label: 'Fichas',
          color: buttonColors.secondary,
        })}
        
        {renderActionButton({
          href: `/historico/${aluno.id}`,
          label: 'Histórico',
          color: buttonColors.info,
        })}
        
        {renderActionButton({
          href: `/edit-aluno/${aluno.id}`,
          label: 'Editar',
          color: buttonColors.warning,
        })}
      </View>
      
      <View style={styles.buttonsRow}>
        {renderActionButton({
          href: `/aluno/${aluno.id}/avaliacao`,
          label: 'Avaliação',
          color: buttonColors.primary,
        })}
        
        {renderActionButton({
          href: `/aluno/${aluno.id}/horarios`,
          label: 'Aulas',
          color: buttonColors.default,
        })}
        
        {renderActionButton({
          label: 'Excluir',
          color: buttonColors.danger,
          onPress: handleDelete,
        })}
      </View>
    </View>
  );
};

export default AlunoCard;
