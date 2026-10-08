import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { ProjectCreateScreen } from '../screens/projects/ProjectCreateScreen';
import { ProjectEditScreen } from '../screens/projects/ProjectEditScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { TaskCreateScreen } from '../screens/tasks/TaskCreateScreen';
import { TaskEditScreen } from '../screens/tasks/TaskEditScreen';

type PrimaryScreen = 'Dashboard' | 'Projects' | 'Tasks' | 'Account';
type ThemeMode = 'light' | 'system' | 'dark';
const PRIMARY_SCREENS: PrimaryScreen[] = ['Dashboard', 'Projects', 'Tasks', 'Account'];
const navigationRef = createNavigationContainerRef<any>();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const BrandTitle = () => {
  const { tokens } = useTheme();
  return (
  <View style={styles.brandRow}>
    <View style={[styles.brandMark, { backgroundColor: tokens.primary }]}><Text style={styles.brandMarkLetter}>N</Text></View>
    <Text style={[styles.brandName, { color: tokens.text }]}>NEXVYRA</Text>
  </View>
  );
};

const AccountScreen = () => {
  const { user, logout } = useAuth();
  const { mode, setMode, tokens } = useTheme();
  const initials = user?.fullName?.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'N';
  const choices: { mode: ThemeMode; label: string; glyph: string }[] = [
    { mode: 'light', label: 'Light', glyph: '☀' },
    { mode: 'system', label: 'System', glyph: '◐' },
    { mode: 'dark', label: 'Dark', glyph: '☾' },
  ];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.background }} contentContainerStyle={styles.accountContent}>
      <Text style={[styles.accountHeading, { color: tokens.text }]}>Account Settings</Text>
      <Text style={[styles.accountSubtitle, { color: tokens.textSecondary }]}>Manage your profile, preferences, and session.</Text>
      <View style={[styles.accountCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.cardHeading, { color: tokens.text }]}>Profile Information</Text>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: tokens.primary }]}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: tokens.text }]}>{user?.fullName || 'NEXVYRA member'}</Text>
            <Text style={[styles.profileEmail, { color: tokens.textSecondary }]} numberOfLines={2}>{user?.email || ''}</Text>
            <Text style={[styles.activeLabel, { color: tokens.success }]}>● Active Member</Text>
          </View>
        </View>
        <Text style={[styles.helpText, { color: tokens.textSecondary, borderTopColor: tokens.border }]}>Your profile details are managed securely by NEXVYRA.</Text>
      </View>
      <View style={[styles.accountCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.cardHeading, { color: tokens.text }]}>Appearance</Text>
        <Text style={[styles.accountSubtitle, { color: tokens.textSecondary }]}>Choose how NEXVYRA looks on this device.</Text>
        <View style={styles.themeOptions}>
          {choices.map(option => {
            const selected = mode === option.mode;
            return (
              <TouchableOpacity key={option.mode} onPress={() => void setMode(option.mode)}
                accessibilityRole="radio" accessibilityState={{ checked: selected }}
                style={[styles.themeChoice, { borderColor: selected ? tokens.primary : tokens.border, backgroundColor: selected ? (mode === 'dark' ? '#243D58' : '#E8F2FC') : tokens.surface }]}>
                <Text style={[styles.themeSymbol, { color: selected ? tokens.primary : tokens.textSecondary }]}>{option.glyph}</Text>
                <Text style={[styles.themeLabel, { color: selected ? tokens.primary : tokens.text }]}>{option.label}</Text>
                <Text style={{ color: tokens.primary }}>{selected ? '●' : '○'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={[styles.accountCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
        <Text style={[styles.cardHeading, { color: tokens.text }]}>Session</Text>
        <TouchableOpacity style={styles.logoutButton} accessibilityRole="button" onPress={() =>
          Alert.alert('Log out?', 'You will need to sign in again.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: () => void logout() },
          ])}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const AppNavigator = () => {
  const { tokens } = useTheme();
  return (
    <AppStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: tokens.surface },
      headerTintColor: tokens.text,
      headerTitleStyle: { fontWeight: '700' },
      contentStyle: { backgroundColor: tokens.background },
      headerTitle: () => <BrandTitle />,
    }}>
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      <AppStack.Screen name="Projects" component={ProjectsScreen} />
      <AppStack.Screen name="Tasks" component={TasksScreen} />
      <AppStack.Screen name="Account" component={AccountScreen} />
      <AppStack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Details', headerTitle: 'Project Details' }} />
      <AppStack.Screen name="ProjectCreate" component={ProjectCreateScreen} options={{ title: 'Create Project', headerTitle: 'Create Project' }} />
      <AppStack.Screen name="ProjectEdit" component={ProjectEditScreen} options={{ title: 'Edit Project', headerTitle: 'Edit Project' }} />
      <AppStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details', headerTitle: 'Task Details' }} />
      <AppStack.Screen name="TaskCreate" component={TaskCreateScreen} options={{ title: 'Create Task', headerTitle: 'Create Task' }} />
      <AppStack.Screen name="TaskEdit" component={TaskEditScreen} options={{ title: 'Edit Task', headerTitle: 'Edit Task' }} />
    </AppStack.Navigator>
  );
};

const BottomNavigation = ({ activeRoute, onNavigate }: {
  activeRoute: PrimaryScreen;
  onNavigate: (route: PrimaryScreen) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();
  return (
    <View style={[styles.floatingDockArea, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: tokens.background }]}>
    <View style={[styles.tabBar, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: isDark ? '#000000' : '#173657' }]}>
      {PRIMARY_SCREENS.map(route => {
        const selected = activeRoute === route;
        const icon: React.ComponentProps<typeof Feather>['name'] = route === 'Dashboard' ? 'grid' : route === 'Projects' ? 'folder' : route === 'Tasks' ? 'check-square' : 'user';
        return (
          <TouchableOpacity key={route} style={styles.tabItem} onPress={() => onNavigate(route)}
            accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={route} activeOpacity={0.75}>
            <View style={[styles.tabIconContainer, selected && { backgroundColor: isDark ? '#30264B' : '#F0E9FF' }]}>
              <Feather name={icon} size={21} color={selected ? tokens.primary : tokens.textSecondary} />
            </View>
            <Text style={[styles.tabLabel, { color: selected ? tokens.primary : tokens.textSecondary, fontWeight: selected ? '800' : '600' }]}>{route}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
    </View>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const { tokens } = useTheme();
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const syncRoute = () => {
    const route = navigationRef.getCurrentRoute()?.name;
    if (route) setActiveRoute(route);
  };

  if (isInitializing) {
    return <View style={[styles.loadingContainer, { backgroundColor: tokens.background }]}>
      <ActivityIndicator size="large" color={tokens.primary} />
      <Text style={[styles.loadingText, { color: tokens.textSecondary }]}>Initializing NEXVYRA...</Text>
    </View>;
  }
  const showTabs = isAuthenticated && PRIMARY_SCREENS.includes(activeRoute as PrimaryScreen);
  return (
    <View style={[styles.root, { backgroundColor: tokens.background }]}>
      <NavigationContainer ref={navigationRef} onReady={syncRoute} onStateChange={syncRoute}>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      {showTabs && <BottomNavigation activeRoute={activeRoute as PrimaryScreen}
        onNavigate={route => {
          if (route !== activeRoute && navigationRef.isReady()) {
            // Primary tabs are destinations, not a growing back stack.
            // Resetting prevents previous tabs from appearing behind the current tab.
            navigationRef.reset({ index: 0, routes: [{ name: route }] });
          }
        }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandMarkLetter: { color: '#FFFFFF', fontWeight: '900', fontSize: 19 },
  brandName: { fontSize: 17, fontWeight: '800', color: '#1769B1', letterSpacing: 1.6 },
  floatingDockArea: { paddingTop: 8, paddingHorizontal: 18 },
  tabBar: { flexDirection: 'row', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 28, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 9 },
  tabItem: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  tabIconContainer: { width: 54, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, marginTop: 4, letterSpacing: 0.15 },
  accountContent: { padding: 18, paddingBottom: 32 },
  accountHeading: { fontSize: 25, fontWeight: '800', marginBottom: 4 },
  accountSubtitle: { fontSize: 13, lineHeight: 19, marginBottom: 15 },
  accountCard: { borderRadius: 17, borderWidth: 1, padding: 18, marginBottom: 16 },
  cardHeading: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 21, fontWeight: '800' },
  profileName: { fontWeight: '700', fontSize: 16 },
  profileEmail: { fontSize: 12, marginTop: 4 },
  activeLabel: { marginTop: 8, fontSize: 12, fontWeight: '700' },
  helpText: { borderTopWidth: 1, paddingTop: 13, marginTop: 17, fontSize: 12, lineHeight: 18 },
  themeOptions: { flexDirection: 'row', gap: 8 },
  themeChoice: { flex: 1, minHeight: 92, borderWidth: 1.5, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 5 },
  themeSymbol: { fontSize: 24 },
  themeLabel: { fontSize: 12, fontWeight: '700' },
  logoutButton: { backgroundColor: '#B42318', borderRadius: 11, minHeight: 47, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
