import { api } from './client';
import { Project } from '@/types';

export interface GetProjectsParams {
  search?: string;
  status?: string;
}

export const getProjects = async (params?: GetProjectsParams) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = new URL(`${baseUrl}/projects`);
  if (params?.search) url.searchParams.append('search', params.search);
  if (params?.status) url.searchParams.append('status', params.status);

  // We only need the pathname + search string for the relative api client
  const endpoint = `/projects${url.search}`;
  return api.get<{ projects: Project[] }>(endpoint);
};

export const getProject = async (id: string) => {
  return api.get<{ project: Project }>(`/projects/${id}`);
};

export const createProject = async (data: Partial<Project>) => {
  return api.post<{ project: Project }>('/projects', data);
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  return api.put<{ project: Project }>(`/projects/${id}`, data);
};

export const deleteProject = async (id: string) => {
  return api.delete(`/projects/${id}`);
};
