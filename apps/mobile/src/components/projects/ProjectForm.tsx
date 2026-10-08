import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Project, ProjectStatus } from '../../types';

interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
}

interface Props {
  initialData?: Partial<Project>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

const parseDate = (dateStr?: string | null) => (dateStr ? new Date(dateStr) : null);

export const ProjectForm = ({ initialData, onSubmit, isSubmitting, submitLabel }: Props) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || 'NOT_STARTED');
  
  const [startDate, setStartDate] = useState<Date | null>(parseDate(initialData?.startDate));
  const [endDate, setEndDate] = useState<Date | null>(parseDate(initialData?.endDate));

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    
    if (!name.trim()) {
      setError('Project Name is required.');
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError('End Date cannot be earlier than Start Date.');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
      startDate,
      endDate,
    });
  };

  const formatDateLabel = (d: Date | null) => {
    if (!d) return 'Select Date';
    return d.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Project Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., Q3 Marketing Campaign"
          value={name}
          onChangeText={setName}
          editable={!isSubmitting}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief description of the project"
          value={description}
          onChangeText={setDescription}
          editable={!isSubmitting}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as ProjectStatus[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusButton, status === s && styles.statusButtonActive]}
              onPress={() => setStatus(s)}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.statusText,
                  status === s && styles.statusTextActive,
                ]}
              >
                {s.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
            disabled={isSubmitting}
          >
            <Text style={styles.dateButtonText}>{formatDateLabel(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (selectedDate) setStartDate(selectedDate);
              }}
            />
          )}
          {startDate && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setStartDate(null)}>
              <Text style={styles.clearDateText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
            disabled={isSubmitting}
          >
            <Text style={styles.dateButtonText}>{formatDateLabel(endDate)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              minimumDate={startDate || undefined}
              onChange={(event, selectedDate) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (selectedDate) setEndDate(selectedDate);
              }}
            />
          )}
          {endDate && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setEndDate(null)}>
              <Text style={styles.clearDateText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
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
    color: '#263E59',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#162B46',
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Using gap if RN supports it, otherwise margin
  },
  statusButton: {
    backgroundColor: '#EDF3FA',
    borderWidth: 1,
    borderColor: '#DCE5F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: '#e0e7ff',
    borderColor: '#1769B1',
  },
  statusText: {
    color: '#637991',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: '#1769B1',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#162B46',
  },
  clearDateText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#1769B1',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
