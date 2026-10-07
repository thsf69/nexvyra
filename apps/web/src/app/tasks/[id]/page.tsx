'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getTask, deleteTask, updateTask } from '@/lib/api/tasks';
import { Task, Project } from '@/types';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function TaskDetailsPage({ params }: { params: { id: string } }) {
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
        const res = await getTask(params.id);
        setTask(res.data?.task || null);
        setProject(res.data?.project || null);
      } catch (err: any) {
        setError(err.status === 404 ? 'Task not found.' : err.message || 'Failed to load task details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteTask(params.id);
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
      const res = await updateTask(params.id, { status: 'COMPLETED' });
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
        <div className="max-w-4xl mx-auto p-8 text-center text-gray-500 animate-pulse">Loading task...</div>
      </AppShell>
    );
  }

  if (error || !task) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 text-red-700 bg-red-50 rounded-md border border-red-100">
            {error || 'Task not found.'}
          </div>
          <div className="mt-4">
            <Link href="/tasks" className="text-indigo-600 hover:text-indigo-900 font-medium">&larr; Back to Tasks</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/tasks" className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
            &larr; Back to Tasks
          </Link>
          {project && (
            <Link href={`/projects/${project.id}`} className="text-sm text-gray-500 hover:text-gray-900">
              View Project: {project.name}
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900 break-words">{task.name}</h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Created on {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {task.description || <span className="italic text-gray-400">No description provided.</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                <p className="mt-1 text-sm text-gray-900">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Project Context</h4>
                <p className="mt-1 text-sm text-gray-900">{project?.name || 'Unknown Project'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 mt-6 flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleDelete}
                disabled={isDeleting || isCompleting}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-70"
              >
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </button>
              <Link
                href={`/tasks/${task.id}/edit`}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit Task
              </Link>
              {task.status !== 'COMPLETED' && (
                <button
                  onClick={handleComplete}
                  disabled={isCompleting || isDeleting}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-70"
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
