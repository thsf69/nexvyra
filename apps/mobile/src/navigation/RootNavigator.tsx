import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { ProjectCreateScreen } from '../screens/projects/ProjectCreateScreen';
import { ProjectEditScreen } from '../screens/projects/ProjectEditScreen';

import { TasksScreen } from '../screens/tasks/TasksScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { TaskCreateScreen } from '../screens/tasks/TaskCreateScreen';
import { TaskEditScreen } from '../screens/tasks/TaskEditScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: '#162B46', headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: '#F4F7FB' } }}>
    <AppStack.Screen name="Dashboard" component={DashboardScreen} />
    <AppStack.Screen name="Projects" component={ProjectsScreen} />
    <AppStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Details' }} />
    <AppStack.Screen name="ProjectCreate" component={ProjectCreateScreen} options={{ title: 'Create Project' }} />
    <AppStack.Screen name="ProjectEdit" component={ProjectEditScreen} options={{ title: 'Edit Project' }} />
    <AppStack.Screen name="Tasks" component={TasksScreen} />
    <AppStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
    <AppStack.Screen name="TaskCreate" component={TaskCreateScreen} options={{ title: 'Create Task' }} />
    <AppStack.Screen name="TaskEdit" component={TaskEditScreen} options={{ title: 'Edit Task' }} />
  </AppStack.Navigator>
);

export const RootNavigator = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Initializing NEXVYRA...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#637991',
  },
});
