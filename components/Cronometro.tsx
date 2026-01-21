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

const Cronometro = forwardRef<CronometroHandle, { textStyle?: any }>((props, ref) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<any>(null);

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - (seconds * 1000);

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          setSeconds(Math.floor((now - startTimeRef.current) / 1000));
        }
      }, 200); // Update more frequently to avoid lag perception
    }
  };

  const reset = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setSeconds(0);
    startTimeRef.current = null;
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
      <Text style={[styles.time, props.textStyle]}>{formatTime(seconds)}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold', // Default, can be overridden
    // color will be handled by parent or default to black if not specified, 
    // but we should probably set a default color compatible with dark theme if used elsewhere
    color: '#FFFFFF',
    marginBottom: 8,
  },
});

export default Cronometro; 