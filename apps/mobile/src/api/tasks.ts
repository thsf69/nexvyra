import { api } from './client';
import { Task, Project } from '../types';

export interface GetTasksParams {
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
}

export const getTasks = async (params?: GetTasksParams) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.projectId) queryParams.append('projectId', params.projectId);

  const queryString = queryParams.toString();
  const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;

  return api.get<{ tasks: Task[] }>(endpoint);
};

export const getTask = async (id: string) => {
  return api.get<{ task: Task; project?: Project }>(`/tasks/${id}`);
};

export const createTask = async (data: Partial<Task>) => {
  return api.post<{ task: Task }>('/tasks', data);
};

export const updateTask = async (id: string, data: Partial<Task>) => {
  return api.put<{ task: Task }>(`/tasks/${id}`, data);
};

export const deleteTask = async (id: string) => {
  return api.delete(`/tasks/${id}`);
};
