import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardTempScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Temporária</Text>
      <Text style={styles.text}>Esta é uma tela inicial temporária do projeto.</Text>
      <Text style={styles.text}>Personalize aqui sua dashboard principal!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFB800',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
});
