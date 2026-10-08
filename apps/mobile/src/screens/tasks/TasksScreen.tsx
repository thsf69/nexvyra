import { useTheme } from '../../context/ThemeContext';
import { ThemeTokens } from '../../theme/tokens';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Task, Project } from '../../types';
import { getTasks } from '../../api/tasks';
import { getProjects } from '../../api/projects';
import { ApiClientError } from '../../api/client';
import { TaskCard } from '../../components/tasks/TaskCard';

type AppStackParamList = {
  Dashboard: undefined;
  Tasks: { projectId?: string };
  TaskDetail: { id: string };
  TaskCreate: { projectId?: string };
};

type TasksScreenRouteProp = RouteProp<AppStackParamList, 'Tasks'>;
type TasksScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Tasks'>;

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const PRIORITY_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
];

export const TasksScreen = () => {
  const { tokens, isDark } = useTheme();
  const styles = useMemo(() => createStyles(tokens, isDark), [tokens, isDark]);
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const route = useRoute<TasksScreenRouteProp>();
  const initialProjectId = route.params?.projectId || '';
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Project Filter state
  const [projectIdFilter, setProjectIdFilter] = useState(initialProjectId);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchTasks = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await getTasks({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        projectId: projectIdFilter || undefined,
      });
      setTasks(res.data?.tasks || []);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load tasks.');
      } else {
        setError('Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserProjects = async () => {
    if (projects.length > 0) return; // already loaded
    setLoadingProjects(true);
    try {
      const res = await getProjects();
      setProjects(res.data?.projects || []);
    } catch (err) {
      // fail silently for projects
    } finally {
      setLoadingProjects(false);
    }
  };

  const skipInitialFilterFetch = useRef(true);
  useEffect(() => {
    // Focus listener handles the initial request; avoid sending it twice.
    if (skipInitialFilterFetch.current) {
      skipInitialFilterFetch.current = false;
      return;
    }
    const delay = setTimeout(() => {
      fetchTasks();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery, statusFilter, priorityFilter, projectIdFilter]);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation, searchQuery, statusFilter, priorityFilter, projectIdFilter]);

  const onRefresh = useCallback(() => {
    fetchTasks(true);
  }, [searchQuery, statusFilter, priorityFilter, projectIdFilter]);

  const clearSearch = () => setSearchQuery('');

  const renderEmptyComponent = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchTasks()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          {searchQuery || statusFilter || priorityFilter || projectIdFilter
            ? 'No tasks match your filters.'
            : "You don't have any tasks yet."}
        </Text>
      </View>
    );
  };

  const selectedProjectName = projectIdFilter 
    ? projects.find(p => p.id === projectIdFilter)?.name || 'Filtered by Project'
    : 'All Projects';

  const renderProjectModal = () => (
    <Modal visible={showProjectModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter by Project</Text>
          {loadingProjects ? (
            <ActivityIndicator style={{ margin: 20 }} color="#1769B1" />
          ) : (
            <FlatList
              data={[{ id: '', name: 'All Projects' }, ...projects]}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, projectIdFilter === item.id && styles.modalItemActive]}
                  onPress={() => {
                    setProjectIdFilter(item.id);
                    setShowProjectModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, projectIdFilter === item.id && styles.modalItemTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProjectModal(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderProjectModal()}
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..." placeholderTextColor={tokens.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search tasks"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton} accessibilityLabel="Clear search">
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity 
          style={styles.projectFilterButton}
          onPress={() => {
            fetchUserProjects();
            setShowProjectModal(true);
          }}
        >
          <Text style={styles.projectFilterText}>{selectedProjectName} ▾</Text>
        </TouchableOpacity>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status:</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={STATUS_FILTERS}
            keyExtractor={(f) => f.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterPill, statusFilter === item.value && styles.filterPillActive]}
                onPress={() => setStatusFilter(item.value)}
              >
                <Text style={[styles.filterText, statusFilter === item.value && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Priority:</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={PRIORITY_FILTERS}
            keyExtractor={(f) => f.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterPill, priorityFilter === item.value && styles.filterPillActive]}
                onPress={() => setPriorityFilter(item.value)}
              >
                <Text style={[styles.filterText, priorityFilter === item.value && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1769B1" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[tokens.primary]} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TaskCreate', { projectId: projectIdFilter })}
        accessibilityLabel="Create Task"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (tokens: ThemeTokens, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.background },
  header: {
    backgroundColor: tokens.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: tokens.text,
  },
  clearButton: { padding: 4 },
  clearButtonText: { color: '#6b7280', fontSize: 16, fontWeight: 'bold' },
  projectFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  projectFilterText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 8,
    width: 55,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterPillActive: { backgroundColor: (isDark ? '#30264B' : (isDark ? '#30264B' : '#F0E9FF')) },
  filterText: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
  filterTextActive: { color: tokens.primary },
  listContent: { padding: 16, flexGrow: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  errorText: { fontSize: 16, color: (isDark ? '#FDA4AF' : '#DC2626'), textAlign: 'center', marginBottom: 16 },
  retryButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 6 },
  retryText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
  fab: {
    position: 'absolute', right: 20, bottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: tokens.primary, width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  fabText: { fontSize: 28, color: tokens.surface, lineHeight: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: tokens.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: tokens.text },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalItemActive: { backgroundColor: tokens.background },
  modalItemText: { fontSize: 16, color: '#374151' },
  modalItemTextActive: { color: tokens.primary, fontWeight: '600' },
  modalCloseButton: { marginTop: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 8 },
  modalCloseText: { fontSize: 16, fontWeight: '600', color: '#374151' },
});
