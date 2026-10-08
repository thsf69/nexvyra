/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ProjectStatus } from '@/types';

export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
}

export const ProjectForm = ({ initialData, onSubmit, isSubmitting, submitLabel }: ProjectFormProps) => {
  const router = useRouter();

  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'NOT_STARTED',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }
    if (!formData.startDate) {
      setError('Start date is required.');
      return;
    }
    if (!formData.endDate) {
      setError('End date is required.');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : ''
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the project.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="nex-glass space-y-7 rounded-2xl border border-border p-5 shadow-sm sm:p-8">
      <div className="border-b border-border/70 pb-5">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Project details</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-text">Set up your project</h2>
        <p className="mt-1 text-sm text-text-secondary">Add the essentials, then set a timeline and status.</p>
      </div>
      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-text">Project Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-2 block w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
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
          className="mt-2 block w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-semibold text-text">Status *</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-2 block w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
        >
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold text-text">Start Date *</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold text-text">End Date *</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="mt-2 block w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="nex-gradient rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};
