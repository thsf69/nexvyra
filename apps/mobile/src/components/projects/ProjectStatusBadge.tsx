import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectStatus } from '../../types';

interface Props {
  status: ProjectStatus;
}

export const ProjectStatusBadge = ({ status }: Props) => {
  let backgroundColor = '#f3f4f6'; // gray-100
  let textColor = '#1f2937'; // gray-800
  let borderColor = '#e5e7eb'; // gray-200
  let label = 'Unknown';

  switch (status) {
    case 'NOT_STARTED':
      backgroundColor = '#f3f4f6';
      textColor = '#1f2937';
      borderColor = '#e5e7eb';
      label = 'Not Started';
      break;
    case 'IN_PROGRESS':
      backgroundColor = '#dbeafe'; // blue-100
      textColor = '#1e40af'; // blue-800
      borderColor = '#bfdbfe'; // blue-200
      label = 'In Progress';
      break;
    case 'COMPLETED':
      backgroundColor = '#dcfce7'; // green-100
      textColor = '#166534'; // green-800
      borderColor = '#bbf7d0'; // green-200
      label = 'Completed';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor, borderColor }]}>
      <Text style={[styles.text, { color: textColor }]} accessibilityLabel={`Status: ${label}`}>
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
