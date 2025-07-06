import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';

export default function Clock() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date();
      setCurrentTime(format(time, 'hh:mm:ss a'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Text style={styles.timeText}>🕓 {currentTime}</Text>;
}

const styles = StyleSheet.create({
  timeText: {
    fontSize: 16,
    color: '#333',
  },
});
