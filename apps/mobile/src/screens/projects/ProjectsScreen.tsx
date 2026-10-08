import React, { useEffect, useState, useCallback, useRef } from 'react';
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
        <Text style={styles.emptyText}>
          {searchQuery || statusFilter
            ? 'No projects match your filters.'
            : "You don't have any projects yet."}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
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
          <ActivityIndicator size="large" color="#1769B1" />
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1769B1']} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF3FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#162B46',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: '#637991',
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
    backgroundColor: '#EDF3FA',
    marginRight: 8,
    marginBottom: 8,
  },
  filterPillActive: {
    backgroundColor: '#e0e7ff',
  },
  filterText: {
    fontSize: 13,
    color: '#637991',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#1769B1',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#637991',
    textAlign: 'center',
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
    backgroundColor: '#EDF3FA',
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    color: '#637991',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#1769B1',
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
    color: '#fff',
    lineHeight: 32,
  },
});
