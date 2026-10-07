import { api } from './client';

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

export const getDashboardMetrics = async () => {
  return api.get<DashboardMetrics>('/dashboard');
};
