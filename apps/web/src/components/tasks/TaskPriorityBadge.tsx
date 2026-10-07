import React from 'react';
import { TaskPriority } from '@/types';

export const TaskPriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  let styles = 'bg-gray-100 text-gray-800';
  let label = 'Unknown';

  switch (priority) {
    case 'LOW':
      styles = 'bg-blue-100 text-blue-800 border border-blue-200';
      label = 'Low';
      break;
    case 'MEDIUM':
      styles = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      label = 'Medium';
      break;
    case 'HIGH':
      styles = 'bg-red-100 text-red-800 border border-red-200';
      label = 'High';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
};
