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
      await onSubmit({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : ''
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-6 rounded-xl shadow-sm border border-border">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text">Task Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-text">Project *</label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
          disabled={isLoadingProjects}
          className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-background"
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
          <label htmlFor="status" className="block text-sm font-medium text-text">Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-text">Priority *</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-text">Due Date *</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-text bg-surface hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingProjects}
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
