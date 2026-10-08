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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 19,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCE5F0',
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
    color: '#162B46',
    marginRight: 12,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8593AF',
  },
  description: {
    fontSize: 14,
    color: '#637991',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyDescription: {
    fontStyle: 'italic',
    color: '#8593AF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DCE5F0',
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
    color: '#9BAAC5',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    color: '#263E59',
    fontWeight: '500',
  },
  overdueDate: {
    color: '#dc2626',
    fontWeight: '700',
  },
});
