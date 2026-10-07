import React from 'react';
import { ProjectStatus } from '@/types';

export const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => {
  let styles = 'bg-gray-100 text-gray-800';
  let label = 'Unknown';

  switch (status) {
    case 'NOT_STARTED':
      styles = 'bg-gray-100 text-gray-800 border border-gray-200';
      label = 'Not Started';
      break;
    case 'IN_PROGRESS':
      styles = 'bg-blue-100 text-blue-800 border border-blue-200';
      label = 'In Progress';
      break;
    case 'COMPLETED':
      styles = 'bg-green-100 text-green-800 border border-green-200';
      label = 'Completed';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
};
