import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { getProject, updateProject } from '../../api/projects';
import { ApiClientError } from '../../api/client';
import { Project } from '../../types';

type AppStackParamList = {
  ProjectEdit: { id: string };
  ProjectDetail: { id: string };
};

type ProjectEditScreenRouteProp = RouteProp<AppStackParamList, 'ProjectEdit'>;
type ProjectEditScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'ProjectDetail'>;

export const ProjectEditScreen = () => {
  const navigation = useNavigation<ProjectEditScreenNavigationProp>();
  const route = useRoute<ProjectEditScreenRouteProp>();
  const { id } = route.params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProject = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProject(id);
      if (res.data?.project) {
        setProject(res.data.project);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load project details.');
      } else {
        setError('Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateProject(id, data);
      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiClientError) {
        Alert.alert('Error', err.message || 'Failed to update project.');
      } else {
        Alert.alert('Error', 'Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7254D7" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Project not found.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProject}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <ProjectForm
          initialData={project}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
  scrollContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0B1020',
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
    backgroundColor: '#26314A',
    borderRadius: 6,
  },
  retryText: {
    fontSize: 14,
    color: '#A6B3CC',
    fontWeight: '500',
  },
});
