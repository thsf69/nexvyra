'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task, TaskPriority, TaskStatus, Project } from '@/types';
import { getProjects } from '@/lib/api/projects';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TaskFormData {
  name: string;
  description: string;
  projectId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

interface TaskFormProps {
  initialData?: Task;
  initialProjectId?: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

export const TaskForm = ({ initialData, initialProjectId, onSubmit, isSubmitting, submitLabel }: TaskFormProps) => {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [formData, setFormData] = useState<TaskFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    projectId: initialData?.projectId || initialProjectId || '',
    priority: initialData?.priority || 'MEDIUM',
    status: initialData?.status || 'PENDING',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data?.projects || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load projects for selection.');
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Task name is required.');
      return;
    }
    if (!formData.projectId) {
      setError('Project selection is required.');
      return;
    }
    if (!formData.dueDate) {
      setError('Due date is required.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Task Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">Project *</label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
          disabled={isLoadingProjects}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
        >
          <option value="">{isLoadingProjects ? 'Loading projects...' : 'Select a project...'}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority *</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date *</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingProjects}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
