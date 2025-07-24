import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
};

export interface CronometroHandle {
  start: () => void;
  reset: () => void;
  getSeconds: () => number;
}

const Cronometro = forwardRef<CronometroHandle>((props, ref) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Usando 'any' temporariamente para o tipo do intervalo
  const intervalRef = useRef<any>(null);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const reset = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSeconds(0);
  };

  const getSeconds = () => seconds;

  useImperativeHandle(ref, () => ({
    start,
    reset,
    getSeconds,
  }));

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(seconds)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Cronometro;
