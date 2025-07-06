import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parse } from 'date-fns';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DateViewScreen() {
  const [groupedTasks, setGroupedTasks] = useState({});

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];

      const grouped = {};
      tasks.forEach((task) => {
        if (!grouped[task.date]) {
          grouped[task.date] = [];
        }
        grouped[task.date].push(task);
      });

      setGroupedTasks(grouped);
    } catch (error) {
      console.log('Error loading tasks:', error);
    }
  };

  const renderTask = (task) => (
    <View
      style={[
        styles.taskItem,
        task.completed && { opacity: 0.5, backgroundColor: theme.card },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.taskTitle,
            task.completed && { textDecorationLine: 'line-through' },
          ]}
        >
          {task.title}
        </Text>
        <Text style={styles.taskTime}>
          <Ionicons name="time-outline" size={16} color={theme.icon} /> {task.time}
        </Text>
      </View>
      {task.completed && (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color={theme.icon}
          style={styles.icon}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📅 All Tasks by Date</Text>

      {Object.keys(groupedTasks).length === 0 ? (
        <Text style={styles.empty}>No tasks available</Text>
      ) : (
        Object.keys(groupedTasks)
          .sort((a, b) => {
            const dateA = parse(a, 'dd/MM/yyyy', new Date());
            const dateB = parse(b, 'dd/MM/yyyy', new Date());
            return dateA - dateB;
          })
          .map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeading}>{date}</Text>
              {groupedTasks[date].map((task) => renderTask(task))}
            </View>
          ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.background,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.primaryText,
    marginBottom: 20,
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 10,
  },
  dateHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primaryText,
    marginBottom: 8,
  },
  taskItem: {
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    color: theme.primaryText,
    fontWeight: 'bold',
  },
  taskTime: {
    color: theme.secondaryText,
    marginTop: 4,
  },
  empty: {
    color: theme.secondaryText,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  icon: {
    marginLeft: 10,
  },
});
