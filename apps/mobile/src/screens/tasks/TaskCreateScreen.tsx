import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskForm } from '../../components/tasks/TaskForm';
import { createTask } from '../../api/tasks';
import { ApiClientError } from '../../api/client';

type AppStackParamList = {
  Tasks: { projectId?: string };
  TaskCreate: { projectId?: string };
};

type TaskCreateScreenRouteProp = RouteProp<AppStackParamList, 'TaskCreate'>;
type TaskCreateScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Tasks'>;

export const TaskCreateScreen = () => {
  const navigation = useNavigation<TaskCreateScreenNavigationProp>();
  const route = useRoute<TaskCreateScreenRouteProp>();
  const defaultProjectId = route.params?.projectId;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createTask(data);
      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiClientError) {
        Alert.alert('Error', err.message || 'Failed to create task.');
      } else {
        Alert.alert('Error', 'Unable to connect to NEXVYRA. Check your internet connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TaskForm
          defaultProjectId={defaultProjectId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Task"
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
});
