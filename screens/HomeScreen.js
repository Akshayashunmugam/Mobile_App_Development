import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, isTomorrow, parse } from 'date-fns';
import { useIsFocused } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadTasks();
  }, [isFocused]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(tasks);
    } catch (error) {
      console.log('Error loading tasks:', error);
    }
  };

  const toggleComplete = async (taskId) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.log('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this task?', [
      { text: 'No' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedTasks = tasks.filter((task) => task.id !== taskId);
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
          } catch (error) {
            console.log('Error deleting task:', error);
          }
        },
      },
    ]);
  };

  const clearCompletedTasks = async () => {
    Alert.alert('Confirm', 'Clear all completed tasks?', [
      { text: 'No' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedTasks = tasks.filter((task) => !task.completed);
            setTasks(updatedTasks);
            await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
          } catch (error) {
            console.log('Error clearing completed tasks:', error);
          }
        },
      },
    ]);
  };

  const renderTask = ({ item }) => (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.taskTitle,
            item.completed && styles.completedTaskText,
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.taskDate}>
          🗓️  {item.date}       🕒 {item.time}
        </Text>
      </View>

      {!item.completed && (
        <>
          <Pressable
            onPress={() => toggleComplete(item.id)}
            android_ripple={{ color: '#ccc', borderless: true }}
            style={{ marginHorizontal: 6 }}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color={theme.icon} />
          </Pressable>

          <Pressable
            onPress={() => deleteTask(item.id)}
            android_ripple={{ color: '#ccc', borderless: true }}
          >
            <Ionicons name="trash-bin-outline" size={22} color={theme.icon} />
          </Pressable>
        </>
      )}
    </View>
  );

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const todayTasks = pendingTasks
    .filter((task) => isToday(parse(task.date, 'dd/MM/yyyy', new Date())))
    .sort((a, b) => a.time.localeCompare(b.time));

  const tomorrowTasks = pendingTasks
    .filter((task) => isTomorrow(parse(task.date, 'dd/MM/yyyy', new Date())))
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcomingTasks = pendingTasks
    .filter((task) => {
      const taskDate = parse(task.date, 'dd/MM/yyyy', new Date());
      return taskDate > new Date() && !isToday(taskDate) && !isTomorrow(taskDate);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const toggleSection = (setter, current) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(!current);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today's Tasks</Text>
      {todayTasks.length === 0 ? (
        <Text style={styles.empty}>No tasks for today</Text>
      ) : (
        <FlatList data={todayTasks} keyExtractor={(item) => item.id} renderItem={renderTask} />
      )}

      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(setShowTomorrow, showTomorrow)}
      >
        <Text style={styles.heading}>Tomorrow's Tasks</Text>
        <Ionicons
          name={showTomorrow ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.icon}
        />
      </TouchableOpacity>
      {showTomorrow && (
        tomorrowTasks.length === 0 ? (
          <Text style={styles.empty}>No tasks for tomorrow</Text>
        ) : (
          <FlatList data={tomorrowTasks} keyExtractor={(item) => item.id} renderItem={renderTask} />
        )
      )}

      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(setShowUpcoming, showUpcoming)}
      >
        <Text style={styles.heading}>Upcoming Tasks</Text>
        <Ionicons
          name={showUpcoming ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.icon}
        />
      </TouchableOpacity>
      {showUpcoming && (
        upcomingTasks.length === 0 ? (
          <Text style={styles.empty}>No upcoming tasks</Text>
        ) : (
          <FlatList data={upcomingTasks} keyExtractor={(item) => item.id} renderItem={renderTask} />
        )
      )}

      {completedTasks.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(setShowCompleted, showCompleted)}
          >
            <Text style={styles.heading}>Completed Tasks ({completedTasks.length})</Text>
            <Ionicons
              name={showCompleted ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.icon}
            />
          </TouchableOpacity>
          {showCompleted && (
            <>
              <FlatList
                data={completedTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
              />
              <TouchableOpacity style={styles.clearButton} onPress={clearCompletedTasks}>
                <Ionicons name="trash-bin" size={16} color="#fff" />
                <Text style={styles.clearButtonText}> Clear Completed</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primaryText,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primaryText,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
  },
  taskDate: {
    color: theme.secondaryText,
    marginTop: 4,
  },
  empty: {
    color: theme.secondaryText,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  clearButton: {
    flexDirection: 'row',
    backgroundColor: theme.icon,
    padding: 10,
    borderRadius: 25,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
