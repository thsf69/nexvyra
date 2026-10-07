import { api } from './client';
import { Project } from '../types';

export interface GetProjectsParams {
  search?: string;
  status?: string;
}

export const getProjects = async (params?: GetProjectsParams) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  
  const queryString = queryParams.toString();
  const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;
  
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
