import React from 'react';
import { TaskStatus } from '@/types';

export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
  let styles = 'bg-gray-100 text-text';
  let label = 'Unknown';

  switch (status) {
    case 'PENDING':
      styles = 'bg-gray-100 text-text border border-border';
      label = 'Pending';
      break;
    case 'IN_PROGRESS':
      styles = 'bg-blue-100 text-blue-800 border border-blue-200';
      label = 'In Progress';
      break;
    case 'COMPLETED':
      styles = 'bg-success/20 text-success border border-green-200';
      label = 'Completed';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
};
