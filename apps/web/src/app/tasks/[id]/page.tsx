'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getTask, deleteTask, updateTask } from '@/lib/api/tasks';
import { Task, Project } from '@/types';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await getTask(id);
        setTask(res.data?.task || null);
        setProject(res.data?.project || null);
      } catch (err: any) {
        setError(err.status === 404 ? 'Task not found.' : err.message || 'Failed to load task details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteTask(id);
      router.push('/tasks');
    } catch (err: any) {
      setError(err.message || 'Failed to delete task.');
      setIsDeleting(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    setIsCompleting(true);
    setError('');
    try {
      const res = await updateTask(id, { status: 'COMPLETED' });
      setTask(res.data?.task || null);
    } catch (err: any) {
      setError(err.message || 'Failed to complete task.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-8 text-center text-text-secondary animate-pulse">Loading task...</div>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl">
        {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">{error}</div>}
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-300">
            {error || 'Task not found.'}
          </div>
          <div className="mt-4">
            <Link href="/tasks" className="text-primary hover:text-primary font-medium">&larr; Back to Tasks</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/tasks" className="text-primary hover:text-primary font-medium text-sm">
            &larr; Back to Tasks
          </Link>
          {project && (
            <Link href={`/projects/${project.id}`} className="text-sm text-text-secondary hover:text-text">
              View Project: {project.name}
            </Link>
          )}
        </div>

        <div className="nex-glass overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-7 sm:px-8">
            <div>
              <h3 className="break-words text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl">{task.name}</h3>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                Created on {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>
          <div className="space-y-7 border-t border-border/70 px-5 py-6 sm:px-8 sm:py-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[.14em] text-text-secondary">Description</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text">
                {task.description || <span className="italic text-text-secondary">No description provided.</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/50 p-5">
                <h4 className="text-xs font-bold uppercase tracking-[.14em] text-text-secondary">Due Date</h4>
                <p className="mt-1 text-sm text-text">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 p-5">
                <h4 className="text-xs font-bold uppercase tracking-[.14em] text-text-secondary">Project Context</h4>
                <p className="mt-1 text-sm text-text">{project?.name || 'Unknown Project'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border/70 pt-6">
              <button
                onClick={handleDelete}
                disabled={isDeleting || isCompleting}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/20 disabled:opacity-60 dark:text-red-300"
              >
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </button>
              <Link
                href={`/tasks/${task.id}/edit`}
                className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-background"
              >
                Edit Task
              </Link>
              {task.status !== 'COMPLETED' && (
                <button
                  onClick={handleComplete}
                  disabled={isCompleting || isDeleting}
                  className="nex-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {isCompleting ? 'Completing...' : 'Complete Task'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
