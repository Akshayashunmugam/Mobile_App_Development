import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import uuid from 'react-native-uuid';
import { format } from 'date-fns';
import * as Notifications from 'expo-notifications';

export default function AddTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const saveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Please enter a task title');
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
      tasks.push(newTask);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      Alert.alert('Success', 'Task added successfully');

      scheduleNotification(newTask);

      // Reset fields
      setTitle('');
      setDate(new Date());
      setTime(new Date());
      navigation.goBack();
    } catch (error) {
      console.log('Error saving task:', error);
    }
  };

  const scheduleNotification = (task) => {
  try {
    const [hours, minutes] = format(time, 'HH:mm').split(':').map(Number);

    const selectedDate = new Date(date);
    selectedDate.setHours(hours);
    selectedDate.setMinutes(minutes);
    selectedDate.setSeconds(0);

    if (selectedDate <= new Date()) {
      console.log('Selected time is in the past. Notification not scheduled.');
      return;
    }

    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: task.title,
      },
      trigger: {
        type: 'date',
        date: selectedDate,
      },
    });
  } catch (error) {
    console.log('Error scheduling notification:', error);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Add New Task</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="create-outline" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              placeholderTextColor={theme.secondaryText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}> Select Date</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()} // Only future dates allowed
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}> Select Time</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              is24Hour={false}
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}

          <Text style={styles.dateTimeText}>
            {format(date, 'dd/MM/yyyy')} | {format(time, 'hh:mm a')}
          </Text>

          <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
            <Text style={styles.saveButtonText}>Save Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: '6%',
  },
  card: {
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.primaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    color: theme.primaryText,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: theme.button,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: theme.buttonText,
    fontWeight: 'bold',
  },
  dateTimeText: {
    textAlign: 'center',
    color: theme.primaryText,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: theme.button,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
