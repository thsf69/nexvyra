import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskPriority } from '../../types';

interface Props {
  priority: TaskPriority;
}

export const TaskPriorityBadge = ({ priority }: Props) => {
  let backgroundColor = '#f3f4f6';
  let textColor = '#1f2937';
  let borderColor = '#e5e7eb';
  let label = 'Unknown';

  switch (priority) {
    case 'LOW':
      backgroundColor = '#f3f4f6'; // gray-100
      textColor = '#4b5563'; // gray-600
      borderColor = '#e5e7eb';
      label = 'Low';
      break;
    case 'MEDIUM':
      backgroundColor = '#fef3c7'; // amber-100
      textColor = '#92400e'; // amber-800
      borderColor = '#fde68a'; // amber-200
      label = 'Medium';
      break;
    case 'HIGH':
      backgroundColor = '#fee2e2'; // red-100
      textColor = '#b91c1c'; // red-700
      borderColor = '#fecaca'; // red-200
      label = 'High';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor, borderColor }]}>
      <Text style={[styles.text, { color: textColor }]} accessibilityLabel={`Priority: ${label}`}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
