import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task, TaskStatus, TaskPriority, Project } from '../../types';
import { getProjects } from '../../api/projects';

interface TaskFormData {
  name: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
}

interface Props {
  initialData?: Partial<Task>;
  defaultProjectId?: string; // e.g. if arriving from Project Detail
  onSubmit: (data: TaskFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

const parseDate = (dateStr?: string | null) => (dateStr ? new Date(dateStr) : null);

export const TaskForm = ({ initialData, defaultProjectId, onSubmit, isSubmitting, submitLabel }: Props) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [projectId, setProjectId] = useState<string>(initialData?.projectId || defaultProjectId || '');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'PENDING');
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'LOW');
  const [dueDate, setDueDate] = useState<Date | null>(parseDate(initialData?.dueDate));

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  // Project Selection State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data?.projects || []);
        // Auto-select if there's only one project and no default is provided
        if (res.data?.projects?.length === 1 && !initialData?.projectId && !defaultProjectId) {
          setProjectId(res.data.projects[0].id);
        }
      } catch (err) {
        // Silent fail, user can retry or we can show an error
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchUserProjects();
  }, [initialData?.projectId, defaultProjectId]);

  const handleSubmit = () => {
    setError('');
    
    if (!name.trim()) {
      setError('Task Name is required.');
      return;
    }

    if (!projectId) {
      setError('Please select a Project.');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      projectId,
      status,
      priority,
      dueDate,
    });
  };

  const selectedProjectName = projects.find(p => p.id === projectId)?.name || 'Select a project...';

  const renderProjectModal = () => (
    <Modal visible={showProjectModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Project</Text>
          {loadingProjects ? (
            <ActivityIndicator style={{ margin: 20 }} color="#7254D7" />
          ) : (
            <FlatList
              data={projects}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, projectId === item.id && styles.modalItemActive]}
                  onPress={() => {
                    setProjectId(item.id);
                    setShowProjectModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, projectId === item.id && styles.modalItemTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyProjectsText}>No projects found. Please create one first.</Text>}
            />
          )}
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowProjectModal(false)}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderProjectModal()}
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Task Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., Write documentation"
          value={name}
          onChangeText={setName}
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Project *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowProjectModal(true)}
          disabled={isSubmitting}
        >
          <Text style={styles.selectButtonText}>{selectedProjectName}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief details about the task"
          value={description}
          onChangeText={setDescription}
          editable={!isSubmitting}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chipButton, status === s && styles.chipButtonActive]}
                onPress={() => setStatus(s)}
                disabled={isSubmitting}
              >
                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>
                  {s.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.statusRow}>
            {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chipButton, priority === p && styles.chipButtonActive]}
                onPress={() => setPriority(p)}
                disabled={isSubmitting}
              >
                <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          disabled={isSubmitting}
        >
          <Text style={styles.dateButtonText}>
            {dueDate ? dueDate.toLocaleDateString() : 'Select Date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
        )}
        {dueDate && Platform.OS !== 'ios' && (
          <TouchableOpacity onPress={() => setDueDate(null)}>
            <Text style={styles.clearDateText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#19243B" />
        ) : (
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DCE4F6',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#19243B',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#F7F8FF',
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'column', // Keeping stack style for mobile tasks since chips wrap
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, 
  },
  chipButton: {
    backgroundColor: '#26314A',
    borderWidth: 1,
    borderColor: '#2C3852',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    marginRight: 8, // fallback if gap isn't supported
  },
  chipButtonActive: {
    backgroundColor: '#e0e7ff',
    borderColor: '#7254D7',
  },
  chipText: {
    color: '#A6B3CC',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#7254D7',
  },
  selectButton: {
    backgroundColor: '#19243B',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#F7F8FF',
  },
  dateButton: {
    backgroundColor: '#19243B',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#F7F8FF',
  },
  clearDateText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#7254D7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#19243B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#19243B',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#F7F8FF',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#26314A',
  },
  modalItemActive: {
    backgroundColor: '#0B1020',
  },
  modalItemText: {
    fontSize: 16,
    color: '#DCE4F6',
  },
  modalItemTextActive: {
    color: '#7254D7',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#26314A',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DCE4F6',
  },
  emptyProjectsText: {
    color: '#A6B3CC',
    textAlign: 'center',
    marginVertical: 20,
  }
});
