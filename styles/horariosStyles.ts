import { StyleSheet } from 'react-native';

const horariosStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 16 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 16, 
    marginBottom: 8 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8, 
    elevation: 1 
  },
  empty: { 
    color: '#888', 
    marginBottom: 8 
  },
});

export default horariosStyles;
