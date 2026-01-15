
import React from 'react';
import { View, Text, StatusBar, Platform } from 'react-native';
import { theme } from '@/styles/theme';

interface ScreenHeaderProps {
  title: string;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title }) => (
  <View style={{
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 24,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }}>
    <Text style={{
      color: theme.colors.text,
      fontSize: 22,
      fontFamily: theme.fonts.title,
      letterSpacing: 1
    }}>
      {title}
    </Text>
  </View>
);

export default ScreenHeader;
