import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

/**
 * Ensures the given project exists and belongs to the specified user.
 * Returns a 404 ApiError if it doesn't exist or doesn't belong to the user,
 * preventing leakage of whether another user's project exists.
 */
export const requireProjectOwnership = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project || project.userId !== userId) {
    throw new ApiError(404, 'Project not found');
  }

  return project;
};

/**
 * Ensures the given task exists and belongs to the specified user.
 * Returns a 404 ApiError if it doesn't exist or doesn't belong to the user.
 */
export const requireTaskOwnership = async (userId: string, taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.userId !== userId) {
    throw new ApiError(404, 'Task not found');
  }

  return task;
};
