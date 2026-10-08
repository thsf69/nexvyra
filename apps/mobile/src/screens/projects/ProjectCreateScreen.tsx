import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { createProject } from '../../api/projects';
import { ApiClientError } from '../../api/client';

type AppStackParamList = {
  Projects: undefined;
};

type ProjectCreateScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Projects'>;

export const ProjectCreateScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProjectCreateScreenNavigationProp>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      // Success, go back to project list
      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiClientError) {
        Alert.alert('Error', err.message || 'Failed to create project.');
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
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: Math.max(insets.bottom, 24) + 40 }]} keyboardShouldPersistTaps="handled">
        <ProjectForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Project"
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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
