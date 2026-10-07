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
import { Project } from '../../types';
import { getProject, deleteProject } from '../../api/projects';
import { ApiClientError } from '../../api/client';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';

type AppStackParamList = {
  Projects: undefined;
  ProjectDetail: { id: string };
  ProjectEdit: { id: string };
  Tasks: { projectId: string };
};

type ProjectDetailScreenRouteProp = RouteProp<AppStackParamList, 'ProjectDetail'>;
type ProjectDetailScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'ProjectDetail'>;

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const ProjectDetailScreen = () => {
  const route = useRoute<ProjectDetailScreenRouteProp>();
  const navigation = useNavigation<ProjectDetailScreenNavigationProp>();
  const { id } = route.params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProject = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await getProject(id);
      if (res.data?.project) {
        setProject(res.data.project);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 404) {
          setError('Project not found.');
        } else {
          setError(err.message || 'Failed to load project details.');
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
      fetchProject();
    });
    return unsubscribe;
  }, [navigation, id]);

  const onRefresh = useCallback(() => {
    fetchProject(true);
  }, [id]);

  const confirmDelete = () => {
    Alert.alert(
      'Delete this project?',
      'Are you sure you want to delete this project? This will also delete all associated tasks. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(id);
      navigation.navigate('Projects');
    } catch (err) {
      if (err instanceof ApiClientError) {
        Alert.alert('Error', err.message || 'Failed to delete project.');
      } else {
        Alert.alert('Error', 'Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
      setIsDeleting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Project not found.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchProject()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{project.name}</Text>
          <ProjectStatusBadge status={project.status} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          {project.description ? (
            <Text style={styles.description}>{project.description}</Text>
          ) : (
            <Text style={[styles.description, styles.emptyDescription]}>
              No description provided.
            </Text>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{formatDate(project.startDate)}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowBorder]}>
            <Text style={styles.detailLabel}>End Date</Text>
            <Text style={styles.detailValue}>{formatDate(project.endDate)}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowBorder]}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{formatDate(project.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.tasksButton}
            onPress={() => navigation.navigate('Tasks', { projectId: project.id })}
            accessibilityRole="button"
            accessibilityLabel="View Tasks"
          >
            <Text style={styles.tasksButtonText}>View Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('ProjectEdit', { id: project.id })}
            accessibilityRole="button"
            accessibilityLabel="Edit Project"
          >
            <Text style={styles.editButtonText}>Edit Project</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.disabledButton]}
            onPress={confirmDelete}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityLabel="Delete Project"
          >
            {isDeleting ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Project</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  emptyDescription: {
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 32,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  detailRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  actionsContainer: {
    gap: 12, // For RN >= 0.71
  },
  tasksButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  tasksButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
});
