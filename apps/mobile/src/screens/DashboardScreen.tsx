import React, { useEffect, useState, useCallback } from 'react';
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

type AppStackParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Tasks: undefined;
  ProjectCreate: undefined;
  TaskCreate: { projectId?: string };
};

type DashboardNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Dashboard'>;

export const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DashboardNavigationProp>();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchMetrics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await getDashboardMetrics();
      if (res.data) setMetrics(res.data);
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
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchMetrics()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!metrics) return null;

    const hasNoData = metrics.totalProjects === 0 && metrics.totalTasks === 0;

    return (
      <View style={styles.content}>
        {hasNoData ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>Your workspace is ready.</Text>
            <Text style={styles.emptyStateSubtitle}>
              Get started by creating your first project and task to track your progress.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Task Completion</Text>
              {metrics.totalTasks === 0 ? (
                <Text style={styles.progressEmptyText}>Create tasks to track progress</Text>
              ) : (
                <View>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[styles.progressBarFill, { width: `${calculateProgress()}%` }]}
                    />
                  </View>
                  <Text style={styles.progressPercent}>{calculateProgress()}% Complete</Text>
                </View>
              )}
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Projects</Text>
                <Text style={styles.metricValue}>{metrics.totalProjects}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Projects in Progress</Text>
                <Text style={styles.metricValue}>{metrics.projectsInProgress}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Tasks</Text>
                <Text style={styles.metricValue}>{metrics.totalTasks}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Pending Tasks</Text>
                <Text style={styles.metricValue}>{metrics.pendingTasks}</Text>
              </View>
              <View style={[styles.metricCard, styles.metricCardHighlight]}>
                <Text style={[styles.metricLabel, styles.metricLabelHighlight]}>Completed</Text>
                <Text style={[styles.metricValue, styles.metricValueHighlight]}>{metrics.completedTasks}</Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProjectCreate')}
              accessibilityRole="button"
              accessibilityLabel="Create Project"
            >
              <Text style={styles.actionButtonText}>+ Create Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TaskCreate', { projectId: undefined })}
              accessibilityRole="button"
              accessibilityLabel="Create Task"
            >
              <Text style={styles.actionButtonText}>+ Create Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => navigation.navigate('Projects')}
              accessibilityRole="button"
              accessibilityLabel="View Projects"
            >
              <Text style={styles.actionButtonTextSecondary}>View Projects</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => navigation.navigate('Tasks')}
              accessibilityRole="button"
              accessibilityLabel="View Tasks"
            >
              <Text style={styles.actionButtonTextSecondary}>View Tasks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.brandText}>NEXVYRA</Text>
        <Text style={styles.greetingText}>Welcome, {user?.fullName || 'User'}</Text>
      </View>
      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  header: {
    backgroundColor: '#4f46e5',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  brandText: {
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  greetingText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  progressEmptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'right',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricCardHighlight: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  metricLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  metricLabelHighlight: {
    color: '#166534',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  metricValueHighlight: {
    color: '#166534',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsContainer: {
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    width: '48%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonTextSecondary: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
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
    minHeight: 52,
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
});
