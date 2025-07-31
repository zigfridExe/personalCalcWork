import React from 'react';
import { View, Text, StatusBar, Platform } from 'react-native';

interface ScreenHeaderProps {
  title: string;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title }) => (
  <View style={{
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 24,
    paddingBottom: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    zIndex: 10,
  }}>
    <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>{title}</Text>
  </View>
);

export default ScreenHeader;
