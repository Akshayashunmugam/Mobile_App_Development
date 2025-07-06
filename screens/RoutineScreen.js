import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export default function RoutineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🗓️ Your Daily Routine</Text>
      <Text style={styles.subtext}>Your routine setup will appear here!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.primaryText,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: theme.secondaryText,
    textAlign: 'center',
  },
});
