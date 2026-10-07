import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../../types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';

interface Props {
  task: Task;
  onPress: () => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const TaskCard = ({ task, onPress }: Props) => {
  // Add overdue indicator visually if needed, safely using JS Date
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View task: ${task.name}`}
    >
      <View style={styles.header}>
        <Text style={[styles.title, task.status === 'COMPLETED' && styles.titleCompleted]} numberOfLines={1}>
          {task.name}
        </Text>
        <TaskStatusBadge status={task.status} />
      </View>
      
      {task.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      ) : (
        <Text style={[styles.description, styles.emptyDescription]}>
          No description
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.badgeRow}>
          <TaskPriorityBadge priority={task.priority} />
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Due</Text>
          <Text style={[styles.dateValue, isOverdue && styles.overdueDate]}>
            {formatDate(task.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyDescription: {
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  dateBlock: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  overdueDate: {
    color: '#dc2626',
    fontWeight: '700',
  },
});
