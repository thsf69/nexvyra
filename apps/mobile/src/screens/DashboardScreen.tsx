import { useTheme } from '../context/ThemeContext';
import { ThemeTokens } from '../theme/tokens';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDashboardMetrics, DashboardMetrics } from '../api/dashboard';
import { ApiClientError } from '../api/client';
import { getProjects } from '../api/projects';
import { getTasks } from '../api/tasks';
import { Project, Task } from '../types';

type AppStackParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Tasks: undefined;
  ProjectCreate: undefined;
  TaskCreate: { projectId?: string };
  ProjectDetail: { id: string };
  TaskDetail: { id: string };
};

type DashboardNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

export const DashboardScreen = () => {
  const { tokens, isDark } = useTheme();
  const styles = useMemo(() => createStyles(tokens, isDark), [tokens, isDark]);
  const { user } = useAuth();
  const navigation = useNavigation<DashboardNavigationProp>();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchMetrics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [res, projectRes, taskRes] = await Promise.all([getDashboardMetrics(), getProjects(), getTasks()]);
      if (!res.data) throw new Error('Dashboard data unavailable');
      setMetrics(res.data);
      setProjects(projectRes.data?.projects || []);
      setTasks(taskRes.data?.tasks || []);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load dashboard.');
      } else {
        setError('Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMetrics();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    fetchMetrics(true);
  }, []);

  const calculateProgress = () => {
    if (!metrics || metrics.totalTasks === 0) return 0;
    return Math.round((metrics.completedTasks / metrics.totalTasks) * 100);
  };

  const renderContent = () => {
    if (loading && !refreshing) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#2374C6" /></View>;
    if (error) return <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.actionButton} onPress={() => fetchMetrics()}><Text style={styles.actionButtonText}>Try again</Text></TouchableOpacity></View>;
    if (!metrics) return null;
    const completion = metrics.totalTasks ? Math.round(metrics.completedTasks / metrics.totalTasks * 100) : 0;
    const activeProjects = projects.filter(p => p.status !== 'COMPLETED').slice(0, 6);
    const upcoming = tasks.filter(t => t.status !== 'COMPLETED').sort((a, b) => (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)).slice(0, 6);
    const stats = [
      { label: 'Total projects', value: metrics.totalProjects, color: tokens.primary },
      { label: 'In progress', value: metrics.projectsInProgress, color: '#38BDF8' },
      { label: 'Open tasks', value: metrics.pendingTasks, color: '#FBBF24' },
      { label: 'Completed tasks', value: metrics.completedTasks, color: '#34D399' },
    ];
    return <View style={styles.content}>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={() => navigation.navigate('TaskCreate', {})}><Text style={styles.actionButtonTextSecondary}>+ New task</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ProjectCreate')}><Text style={styles.actionButtonText}>+ New project</Text></TouchableOpacity>
      </View>
      <View style={styles.metricsGrid}>{stats.map(item => <View key={item.label} style={styles.metricCard}><View style={styles.metricHeading}><View style={[styles.statDot, { backgroundColor: item.color }]} /><Text style={styles.metricLabel}>{item.label}</Text></View><Text style={styles.metricValue}>{item.value}</Text></View>)}</View>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Project workspace</Text><Text style={styles.sectionSubtitle}>Your active projects and their current status</Text></View><TouchableOpacity onPress={() => navigation.navigate('Projects')}><Text style={styles.sectionLink}>All projects →</Text></TouchableOpacity></View>
        {activeProjects.length ? activeProjects.map((project, i) => <TouchableOpacity key={project.id} style={styles.listRow} onPress={() => navigation.navigate('ProjectDetail', { id: project.id })}><View style={[styles.projectAvatar, { backgroundColor: ['#7958E9','#2879C8','#4F66CB','#158B88'][i % 4] }]}><Text style={styles.projectAvatarText}>{project.name.charAt(0).toUpperCase()}</Text></View><View style={styles.rowBody}><Text style={styles.rowTitle} numberOfLines={1}>{project.name}</Text><Text style={styles.rowSubtitle} numberOfLines={1}>{project.description || 'No description yet'}</Text><Text style={styles.rowMeta}>{project.status.replace(/_/g, ' ').toLowerCase()}</Text></View><Text style={styles.rowArrow}>›</Text></TouchableOpacity>) : <Text style={styles.emptyText}>No active projects yet. Create your first project to get started.</Text>}
      </View>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Task progress</Text><Text style={styles.sectionSubtitle}>Your overall completion rate</Text>
        <View style={styles.progressCenter}><Text style={styles.progressNumber}>{completion}%</Text><Text style={styles.sectionSubtitle}>completed</Text></View>
        <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${completion}%` }]} /></View>
        <View style={styles.progressSummary}><Text style={styles.rowSubtitle}>Total tasks</Text><Text style={styles.rowTitle}>{metrics.totalTasks}</Text></View>
        <View style={styles.progressSummary}><Text style={styles.rowSubtitle}>Completed</Text><Text style={styles.rowTitle}>{metrics.completedTasks}</Text></View>
        <View style={styles.progressSummary}><Text style={styles.rowSubtitle}>Pending</Text><Text style={styles.rowTitle}>{metrics.pendingTasks}</Text></View>
      </View>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Upcoming tasks</Text><Text style={styles.sectionSubtitle}>Stay focused on what needs attention</Text></View><TouchableOpacity onPress={() => navigation.navigate('Tasks')}><Text style={styles.sectionLink}>View tasks →</Text></TouchableOpacity></View>
        {upcoming.length ? upcoming.map(task => <TouchableOpacity key={task.id} style={styles.taskRow} onPress={() => navigation.navigate('TaskDetail', { id: task.id })}><View style={styles.taskCheckbox}/><View style={styles.rowBody}><Text style={styles.rowTitle} numberOfLines={1}>{task.name}</Text><Text style={styles.rowSubtitle}>{task.priority.toLowerCase()} priority · {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due date'}</Text></View><Text style={styles.rowArrow}>›</Text></TouchableOpacity>) : <Text style={styles.emptyText}>No open tasks. You're all caught up.</Text>}
      </View>
      <View style={styles.sectionCard}><Text style={styles.sectionTitle}>Quick access</Text><Text style={styles.sectionSubtitle}>Jump back into your workflow</Text><TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('Projects')}><Text style={styles.rowTitle}>▦   Manage projects</Text><Text style={styles.rowArrow}>›</Text></TouchableOpacity><TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('Tasks')}><Text style={styles.rowTitle}>☑   Task board</Text><Text style={styles.rowArrow}>›</Text></TouchableOpacity></View>
    </View>;
  };

  return <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tokens.primary]} />}>
    <View style={styles.header}><Text style={styles.brandText}>NEXVYRA / WORKSPACE</Text><Text style={styles.greetingText}>Good to see you, <Text style={styles.highlight}>{user?.fullName?.split(' ')[0] || 'there'}</Text></Text><Text style={styles.headerSubtitle}>Everything you need to move your work forward.</Text></View>
    {renderContent()}
  </ScrollView>;

};

const createStyles = (tokens: ThemeTokens, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.background },
  header: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  brandText: { fontSize: 11, letterSpacing: 2, fontWeight: '800', color: tokens.primary, marginBottom: 12 },
  greetingText: { fontSize: 26, fontWeight: '800', color: tokens.text, lineHeight: 34 },
  highlight: { color: tokens.primary },
  headerSubtitle: { fontSize: 13, color: tokens.textSecondary, marginTop: 9 },
  content: { paddingHorizontal: 16, paddingBottom: 44 },
  centerContainer: { padding: 30, minHeight: 220, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FCA5A5', marginBottom: 14, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: { width: '48%', minHeight: 48, backgroundColor: tokens.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  actionButtonSecondary: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: '#CBD7E5' },
  actionButtonText: { color: tokens.surface, fontWeight: '700', fontSize: 13 },
  actionButtonTextSecondary: { color: tokens.text, fontWeight: '700', fontSize: 13 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: { width: '48%', backgroundColor: tokens.surface, borderColor: tokens.border, borderWidth: 1, borderRadius: 18, padding: 17, marginBottom: 13 },
  metricHeading: { flexDirection: 'row', alignItems: 'center' },
  statDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  metricLabel: { color: tokens.textSecondary, fontSize: 11, flexShrink: 1 },
  metricValue: { color: tokens.text, fontSize: 30, fontWeight: '800', marginTop: 13 },
  sectionCard: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: 20, padding: 18, marginBottom: 16 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 6 },
  sectionTitle: { color: tokens.text, fontSize: 17, fontWeight: '800' },
  sectionSubtitle: { color: tokens.textSecondary, fontSize: 11, marginTop: 5, lineHeight: 17 },
  sectionLink: { color: tokens.primary, fontWeight: '700', fontSize: 11, paddingVertical: 3 },
  listRow: { backgroundColor: '#111B2E', borderWidth: 1, borderColor: tokens.border, borderRadius: 13, padding: 12, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  projectAvatar: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  projectAvatarText: { color: tokens.surface, fontWeight: '800', fontSize: 17 },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { color: tokens.text, fontWeight: '700', fontSize: 13 },
  rowSubtitle: { color: tokens.textSecondary, fontSize: 11, marginTop: 4 },
  rowMeta: { color: tokens.primary, fontSize: 10, marginTop: 5, textTransform: 'capitalize' },
  rowArrow: { color: tokens.textSecondary, fontSize: 22 },
  emptyText: { color: tokens.textSecondary, fontSize: 13, paddingVertical: 20, lineHeight: 20 },
  progressCenter: { width: 150, height: 150, borderRadius: 75, borderWidth: 12, borderColor: tokens.primary, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: 20, backgroundColor: '#111B2E' },
  progressNumber: { color: tokens.text, fontSize: 34, fontWeight: '800' },
  progressBarBackground: { height: 7, backgroundColor: tokens.border, borderRadius: 5, overflow: 'hidden', marginBottom: 18 },
  progressBarFill: { height: '100%', backgroundColor: tokens.primary, borderRadius: 5 },
  progressSummary: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderTopWidth: 1, borderTopColor: tokens.border },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderTopWidth: 1, borderTopColor: tokens.border, gap: 12 },
  taskCheckbox: { width: 17, height: 17, borderWidth: 2, borderColor: '#8B6CF0', borderRadius: 5 },
});
