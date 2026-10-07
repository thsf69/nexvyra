import { api } from './client';
import { Task, Project } from '@/types';

export interface GetTasksParams {
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
}

export const getTasks = async (params?: GetTasksParams) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = new URL(`${baseUrl}/tasks`);
  if (params?.search) url.searchParams.append('search', params.search);
  if (params?.status) url.searchParams.append('status', params.status);
  if (params?.priority) url.searchParams.append('priority', params.priority);
  if (params?.projectId) url.searchParams.append('projectId', params.projectId);

  const endpoint = `/tasks${url.search}`;
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
