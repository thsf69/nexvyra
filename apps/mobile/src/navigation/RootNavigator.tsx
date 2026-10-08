import React, { useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

type PrimaryScreen = 'Dashboard' | 'Projects' | 'Tasks';
const PRIMARY_SCREENS: PrimaryScreen[] = ['Dashboard', 'Projects', 'Tasks'];
const navigationRef = createNavigationContainerRef<any>();

const BottomNavigation = ({
  activeRoute,
  onNavigate,
}: {
  activeRoute: PrimaryScreen;
  onNavigate: (route: PrimaryScreen) => void;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {PRIMARY_SCREENS.map(route => {
        const selected = activeRoute === route;
        const icon = route === 'Dashboard' ? '▦' : route === 'Projects' ? '▤' : '☑';
        return (
          <TouchableOpacity
            key={route}
            style={styles.tabItem}
            onPress={() => onNavigate(route)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={route}
            activeOpacity={0.75}
          >
            <View style={[styles.tabIconContainer, selected && styles.tabIconActive]}>
              <Text style={[styles.tabIcon, selected && styles.tabIconSelected]}>{icon}</Text>
            </View>
            <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{route}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const [activeRoute, setActiveRoute] = useState('Dashboard');

  const syncRoute = () => {
    const route = navigationRef.getCurrentRoute()?.name;
    if (route) setActiveRoute(route);
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1769B1" />
        <Text style={styles.loadingText}>Initializing NEXVYRA...</Text>
      </View>
    );
  }

  const showTabs = isAuthenticated && PRIMARY_SCREENS.includes(activeRoute as PrimaryScreen);

  return (
    <View style={styles.root}>
      <NavigationContainer ref={navigationRef} onReady={syncRoute} onStateChange={syncRoute}>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      {showTabs && (
        <BottomNavigation
          activeRoute={activeRoute as PrimaryScreen}
          onNavigate={route => {
            if (route !== activeRoute && navigationRef.isReady()) {
              navigationRef.navigate(route);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F7FB' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FB',
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#637991' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DCE5F0',
    paddingTop: 8,
    paddingHorizontal: 12,
    shadowColor: '#162B46',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    width: 52, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  tabIconActive: { backgroundColor: '#E8F2FC' },
  tabIcon: { color: '#637991', fontSize: 23, lineHeight: 27 },
  tabIconSelected: { color: '#1769B1' },
  tabLabel: { color: '#637991', fontSize: 11, fontWeight: '600', marginTop: 3 },
  tabLabelActive: { color: '#1769B1', fontWeight: '800' },
});
