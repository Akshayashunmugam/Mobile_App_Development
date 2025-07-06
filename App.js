import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import RoutineScreen from './screens/RoutineScreen';
import AddRoutineScreen from './screens/AddRoutineScreen';
import { theme } from './theme/theme';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    Notifications.requestPermissionsAsync();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
      }),
    });
  }, []);

  const MainTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Add Task') iconName = 'add-circle';
          else if (route.name === 'Routine') iconName = 'calendar';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.button,
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.primaryText },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Task" component={AddTaskScreen} />
      <Tab.Screen name="Routine" component={RoutineScreen} />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator>
        <Stack.Screen
          name="TaskRoutineApp"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddRoutine"
          component={AddRoutineScreen}
          options={{
            title: 'Add Routine',
            headerStyle: { backgroundColor: theme.background },
            headerTitleStyle: { color: theme.primaryText },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
