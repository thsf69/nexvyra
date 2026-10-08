import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task, Project } from '../../types';
import { getTask, deleteTask, updateTask } from '../../api/tasks';
import { ApiClientError } from '../../api/client';
import { TaskStatusBadge } from '../../components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '../../components/tasks/TaskPriorityBadge';

type AppStackParamList = {
  Tasks: undefined;
  TaskDetail: { id: string };
  TaskEdit: { id: string };
};

type TaskDetailScreenRouteProp = RouteProp<AppStackParamList, 'TaskDetail'>;
type TaskDetailScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'TaskDetail'>;

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const TaskDetailScreen = () => {
  const route = useRoute<TaskDetailScreenRouteProp>();
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const { id } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchTask = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await getTask(id);
      if (res.data?.task) {
        setTask(res.data.task);
        if (res.data.project) setProject(res.data.project);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 404) {
          setError('Task not found.');
        } else {
          setError(err.message || 'Failed to load task details.');
        }
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
      fetchTask();
    });
    return unsubscribe;
  }, [navigation, id]);

  const onRefresh = useCallback(() => {
    fetchTask(true);
  }, [id]);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await updateTask(id, { status: 'COMPLETED' });
      setTask(res.data?.task || task);
    } catch (err) {
      if (err instanceof ApiClientError) {
        Alert.alert('Error', err.message || 'Failed to complete task.');
      } else {
        Alert.alert('Error', 'Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete this task?',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(id);
      navigation.navigate('Tasks');
    } catch (err) {
      if (err instanceof ApiClientError) {
        Alert.alert('Error', err.message || 'Failed to delete task.');
      } else {
        Alert.alert('Error', 'Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
      setIsDeleting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7254D7" />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Task not found.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchTask()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7254D7']} />}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, task.status === 'COMPLETED' && styles.titleCompleted]}>
            {task.name}
          </Text>
          <View style={styles.badgeRow}>
            <View style={{ marginRight: 8 }}>
              <TaskStatusBadge status={task.status} />
            </View>
            <TaskPriorityBadge priority={task.priority} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project</Text>
          <Text style={styles.projectName}>{project?.name || 'Unknown Project'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : (
            <Text style={[styles.description, styles.emptyDescription]}>
              No description provided.
            </Text>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{formatDate(task.dueDate)}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowBorder]}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{formatDate(task.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {task.status !== 'COMPLETED' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
              disabled={isCompleting || isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Complete Task"
            >
              {isCompleting ? (
                <ActivityIndicator color="#19243B" />
              ) : (
                <Text style={styles.completeButtonText}>Complete Task</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('TaskEdit', { id: task.id })}
            disabled={isCompleting || isDeleting}
            accessibilityRole="button"
            accessibilityLabel="Edit Task"
          >
            <Text style={styles.editButtonText}>Edit Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.disabledButton]}
            onPress={confirmDelete}
            disabled={isCompleting || isDeleting}
            accessibilityRole="button"
            accessibilityLabel="Delete Task"
          >
            {isDeleting ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1020' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0B1020' },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F7F8FF', marginBottom: 12 },
  titleCompleted: { textDecorationLine: 'line-through', color: '#9ca3af' },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#A6B3CC', textTransform: 'uppercase', marginBottom: 6 },
  projectName: { fontSize: 16, color: '#F7F8FF', fontWeight: '500' },
  description: { fontSize: 16, color: '#A6B3CC', lineHeight: 24 },
  emptyDescription: { fontStyle: 'italic', color: '#9ca3af' },
  detailsCard: { backgroundColor: '#19243B', borderRadius: 12, borderWidth: 1, borderColor: '#2C3852', marginBottom: 32, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16 },
  detailRowBorder: { borderTopWidth: 1, borderTopColor: '#26314A' },
  detailLabel: { fontSize: 15, fontWeight: '500', color: '#A6B3CC' },
  detailValue: { fontSize: 15, fontWeight: '500', color: '#F7F8FF' },
  actionsContainer: { gap: 12 },
  completeButton: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  completeButtonText: { color: '#19243B', fontSize: 16, fontWeight: '600' },
  editButton: { backgroundColor: '#26314A', borderWidth: 1, borderColor: '#2C3852', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  editButtonText: { color: '#DCE4F6', fontSize: 16, fontWeight: '600' },
  deleteButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  disabledButton: { opacity: 0.7 },
  deleteButtonText: { color: '#dc2626', fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 16, color: '#dc2626', textAlign: 'center', marginBottom: 16 },
  retryButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#26314A', borderRadius: 6 },
  retryText: { fontSize: 14, color: '#A6B3CC', fontWeight: '500' },
});
