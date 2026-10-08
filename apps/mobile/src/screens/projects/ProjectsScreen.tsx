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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Project, ProjectStatus } from '../../types';
import { getProjects } from '../../api/projects';
import { ApiClientError } from '../../api/client';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Feather } from '@expo/vector-icons';

type AppStackParamList = {
  Dashboard: undefined;
  Projects: undefined;
  ProjectDetail: { id: string };
  ProjectCreate: undefined;
  ProjectEdit: { id: string };
};

type ProjectsScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Projects'>;

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Not Started', value: 'NOT_STARTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

export const ProjectsScreen = () => {
  const { tokens, isDark } = useTheme();
  const styles = useMemo(() => createStyles(tokens, isDark), [tokens, isDark]);
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProjects = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const res = await getProjects({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      });
      setProjects(res.data?.projects || []);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load projects.');
      } else {
        setError('Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Debounce search fetching
    const delay = setTimeout(() => {
      fetchProjects();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery, statusFilter]);
  
  useEffect(() => {
    // Refresh when screen focuses in case changes were made in detail/edit screens
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProjects();
    });
    return unsubscribe;
  }, [navigation, searchQuery, statusFilter]);

  const onRefresh = useCallback(() => {
    fetchProjects(true);
  }, [searchQuery, statusFilter]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchProjects()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIcon}><Feather name="folder-plus" size={28} color={tokens.primary} /></View>
        <Text style={styles.emptyTitle}>{searchQuery || statusFilter ? 'No matching projects' : 'Your workspace starts here'}</Text>
        <Text style={styles.emptyText}>{searchQuery || statusFilter ? 'Try a different search or status.' : 'Create a project to organize your work and track progress.'}</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => searchQuery || statusFilter ? (setSearchQuery(''), setStatusFilter('')) : navigation.navigate('ProjectCreate')}><Text style={styles.emptyButtonText}>{searchQuery || statusFilter ? 'Clear filters' : '+ Create project'}</Text></TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..." placeholderTextColor={tokens.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search projects"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton} accessibilityLabel="Clear search">
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterContainer}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.label}
              style={[
                styles.filterPill,
                statusFilter === filter.value && styles.filterPillActive,
              ]}
              onPress={() => setStatusFilter(filter.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: statusFilter === filter.value }}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tokens.primary} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => navigation.navigate('ProjectDetail', { id: item.id })}
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
        onPress={() => navigation.navigate('ProjectCreate')}
        accessibilityLabel="Create Project"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (tokens: ThemeTokens, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.background,
  },
  header: {
    backgroundColor: tokens.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (isDark ? '#273149' : '#F0F0F8'),
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
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: tokens.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: (isDark ? '#273149' : '#F0F0F8'),
    marginRight: 8,
    marginBottom: 8,
  },
  filterPillActive: {
    backgroundColor: (isDark ? '#30264B' : '#F0E9FF'),
  },
  filterText: {
    fontSize: 13,
    color: tokens.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: tokens.primary,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 240,
    marginTop: 22,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 18,
  },
  emptyIcon: { width: 62, height: 62, borderRadius: 18, backgroundColor: isDark ? '#30264B' : '#F0E9FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: tokens.text, marginBottom: 6, textAlign: 'center' },
  emptyButton: { backgroundColor: tokens.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 18 },
  emptyButtonText: { color: isDark ? '#101729' : '#FFFFFF', fontSize: 14, fontWeight: '700' },
  emptyText: {
    fontSize: 16,
    color: tokens.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    color: (isDark ? '#FDA4AF' : '#DC2626'),
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: (isDark ? '#273149' : '#F0F0F8'),
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    color: tokens.textSecondary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: tokens.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
  },
});
