import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskForm } from '../../components/tasks/TaskForm';
import { getTask, updateTask } from '../../api/tasks';
import { ApiClientError } from '../../api/client';
import { Task } from '../../types';

type AppStackParamList = {
  TaskEdit: { id: string };
  TaskDetail: { id: string };
};

type TaskEditScreenRouteProp = RouteProp<AppStackParamList, 'TaskEdit'>;
type TaskEditScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'TaskDetail'>;

export const TaskEditScreen = () => {
  const navigation = useNavigation<TaskEditScreenNavigationProp>();
  const route = useRoute<TaskEditScreenRouteProp>();
  const { id } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTask(id);
      if (res.data?.task) {
        setTask(res.data.task);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load task details.');
      } else {
        setError('Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateTask(id, data);
      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiClientError) {
        Alert.alert('Error', err.message || 'Failed to update task.');
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
        <ActivityIndicator size="large" color="#1769B1" />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Task not found.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTask}>
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
        <TaskForm
          initialData={task}
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
    backgroundColor: '#F4F7FB',
  },
  scrollContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F4F7FB',
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
});
