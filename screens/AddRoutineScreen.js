import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';
import { theme } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

export default function AddRoutineScreen() {

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const navigation = useNavigation();

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }

    const selectedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    if (selectedDateTime <= new Date()) {
      Alert.alert('Invalid Time', 'Please select a future date and time.');
      return;
    }

    const newTask = {
      id: uuid.v4(),
      title,
      date: format(date, 'dd/MM/yyyy'),
      time: format(time, 'hh:mm a'),
      completed: false,
    };

    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];

      const updatedTasks = [...tasks, newTask].sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('/'));
        const dateB = new Date(b.date.split('/').reverse().join('/'));

        if (dateA.getTime() === dateB.getTime()) {
          return a.time.localeCompare(b.time);
        }
        return dateA - dateB;
      });

      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: title,
        },
        trigger: selectedDateTime,
      });

      Alert.alert('Success', 'Task added and notification scheduled!');
      setTitle('');
      setDate(new Date());
      setTime(new Date());
      navigation.goBack();
    } catch (error) {
      console.log('Error saving task:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add New Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Task Title"
        placeholderTextColor={theme.secondaryText}
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.pickerButtonText}>
          {`Select Date: ${format(date, 'dd/MM/yyyy')}`}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          minimumDate={new Date()}
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.pickerButtonText}>
          {`Select Time: ${format(time, 'hh:mm a')}`}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) setTime(selectedTime);
          }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primaryText,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: theme.border,
    borderWidth: 1,
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: theme.primaryText,
  },
  pickerButton: {
    backgroundColor: theme.button,
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  pickerButtonText: {
    color: theme.buttonText,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: theme.icon,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  addButtonText: {
    color: theme.buttonText,
    textAlign: 'center',
    fontSize: 16,
  },
});
