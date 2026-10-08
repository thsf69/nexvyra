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
    <form onSubmit={handleSubmit} className="nex-glass space-y-7 rounded-2xl border border-border/70 bg-surface p-5 shadow-sm sm:p-8">
      <div className="border-b border-border/70 pb-6"><p className="text-[11px] font-bold uppercase tracking-[.2em] text-primary">Workspace / {initialData ? "Edit" : "Create"}</p><h2 className="mt-2 text-xl font-bold tracking-tight text-text">{initialData ? "Update" : "New"} task</h2><p className="mt-1 text-sm text-text-secondary">Fill in the details below to plan and track your work.</p></div>
      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-text">Task Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-2 block w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-text">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-2 block w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="projectId" className="block text-sm font-semibold text-text">Project *</label>
        <select
          id="projectId"
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          required
          disabled={isLoadingProjects}
          className="mt-2 block w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
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
          <label htmlFor="status" className="block text-sm font-semibold text-text">Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-semibold text-text">Priority *</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-semibold text-text">Due Date *</label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          className="mt-2 block w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingProjects}
          className="nex-gradient rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
