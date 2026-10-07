import prisma from '../config/prisma';
import { ProjectStatus, TaskStatus } from '@prisma/client';

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

export const getDashboardMetrics = async (userId: string): Promise<DashboardMetrics> => {
  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    projectsInProgress
  ] = await Promise.all([
    // totalProjects
    prisma.project.count({
      where: { userId }
    }),
    // totalTasks
    prisma.task.count({
      where: { userId }
    }),
    // completedTasks
    prisma.task.count({
      where: { userId, status: TaskStatus.COMPLETED }
    }),
    // pendingTasks
    prisma.task.count({
      where: { userId, status: TaskStatus.PENDING }
    }),
    // projectsInProgress
    prisma.project.count({
      where: { userId, status: ProjectStatus.IN_PROGRESS }
    })
  ]);

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    projectsInProgress
  };
};
