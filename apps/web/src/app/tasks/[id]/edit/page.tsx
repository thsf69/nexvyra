'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { TaskForm, TaskFormData } from '@/components/tasks/TaskForm';
import { getTask, updateTask } from '@/lib/api/tasks';
import { Task } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTask(id);
        setTask(res.data?.task || null);
      } catch (err: any) {
        setError(err.status === 404 ? 'Task not found.' : err.message || 'Failed to load task.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await updateTask(id, data);
      router.push(`/tasks/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto p-8 text-center text-text-secondary animate-pulse">Loading task...</div>
      </AppShell>
    );
  }

  if (error || !task) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto p-4 text-red-700 bg-red-50 rounded-md border border-red-100">
          {error || 'Task not found.'}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-8">Edit Task</h1>
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
        />
      </div>
    </AppShell>
  );
}
