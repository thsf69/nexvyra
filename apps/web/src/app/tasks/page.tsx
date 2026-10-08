'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getTasks } from '@/lib/api/tasks';
import { Task, Project } from '@/types';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge';

/* eslint-disable @typescript-eslint/no-explicit-any */

function TasksListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialPriority = searchParams.get('priority') || '';

  const [tasks, setTasks] = useState<(Task & { project?: Project })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);

  const lastPushedSearch = React.useRef(initialSearch);
  const lastPushedStatus = React.useRef(initialStatus);
  const lastPushedPriority = React.useRef(initialPriority);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      
      const currentProjectId = searchParams.get('projectId');
      if (currentProjectId) params.set('projectId', currentProjectId);
      
      const currentQuery = searchParams.toString();
      const newQuery = params.toString();
      
      if (currentQuery !== newQuery) {
        lastPushedSearch.current = searchTerm;
        lastPushedStatus.current = statusFilter;
        lastPushedPriority.current = priorityFilter;
        router.push(`/tasks${newQuery ? `?${newQuery}` : ''}`);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, priorityFilter, router, searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || '';
    const currentPriority = searchParams.get('priority') || '';
    
    if (currentSearch !== lastPushedSearch.current) {
      setSearchTerm(currentSearch);
      lastPushedSearch.current = currentSearch;
    }
    if (currentStatus !== lastPushedStatus.current) {
      setStatusFilter(currentStatus);
      lastPushedStatus.current = currentStatus;
    }
    if (currentPriority !== lastPushedPriority.current) {
      setPriorityFilter(currentPriority);
      lastPushedPriority.current = currentPriority;
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError('');
      try {
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') || undefined;
        const priority = searchParams.get('priority') || undefined;
        const projectId = searchParams.get('projectId') || undefined;
        const res = await getTasks({ search, status, priority, projectId });
        setTasks(res.data?.tasks || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [searchParams]);

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'COMPLETED' && !!dueDate && new Date(dueDate) < new Date();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const emptyStateCreateHref = searchParams.get('projectId') 
    ? `/tasks/new?projectId=${searchParams.get('projectId')}` 
    : `/tasks/new`;

  return (
    <>
      <div className="nex-glass p-4 sm:p-5 rounded-2xl border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search tasks</label>
            <input
              type="text"
              id="search"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border border-border bg-background/70 text-text rounded-xl py-3 px-4 outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm"
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor="status" className="sr-only">Filter by status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border border-border bg-background/70 text-text rounded-xl py-3 px-4 outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="sm:w-48">
            <label htmlFor="priority" className="sr-only">Filter by priority</label>
            <select
              id="priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full border border-border bg-background/70 text-text rounded-xl py-3 px-4 outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          {(searchTerm || statusFilter || priorityFilter) && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-text-secondary hover:text-text px-2 py-1"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-50 rounded-md border border-red-100 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => {
              setIsLoading(true);
              setError('');
              getTasks({ 
                search: searchParams.get('search') || undefined, 
                status: searchParams.get('status') || undefined,
                priority: searchParams.get('priority') || undefined,
                projectId: searchParams.get('projectId') || undefined 
              })
                .then(res => setTasks(res.data?.tasks || []))
                .catch((err: any) => setError(err.message || 'Failed to load tasks'))
                .finally(() => setIsLoading(false));
            }}
            className="ml-4 px-3 py-1.5 border border-red-200 rounded-md shadow-sm text-sm font-medium text-red-700 bg-surface hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="nex-glass rounded-2xl text-center py-12 text-text-secondary animate-pulse">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="nex-glass rounded-2xl border border-dashed border-border p-12 text-center">
          {searchTerm || statusFilter || priorityFilter ? (
            <p className="text-text-secondary">No tasks match your current filters.</p>
          ) : (
            <div>
              <p className="text-text-secondary mb-4">No tasks yet.</p>
              <Link href={emptyStateCreateHref} className="text-primary hover:text-primary font-medium">
                Create your first task to get started
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="nex-glass rounded-2xl border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-5 sm:px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-primary/5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="text-sm font-medium text-text truncate">
                        {task.name}
                      </p>
                      <TaskStatusBadge status={task.status} />
                      <TaskPriorityBadge priority={task.priority} />
                      {isOverdue(task.dueDate ? task.dueDate.toString() : "", task.status) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-text-secondary">
                          {task.description ? (
                            <span className="truncate max-w-xs">{task.description}</span>
                          ) : (
                            <span className="italic text-text-secondary">No description</span>
                          )}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-text-secondary sm:mt-0">
                        <p>
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="sm:ml-5 flex-shrink-0 flex gap-2">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                    >
                      View
                    </Link>
                    <Link
                      href={`/tasks/${task.id}/edit`}
                      className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-background hover:text-text"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default function TasksPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-7">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-primary">Workspace / Execution</p>
            <h1 className="text-3xl font-bold tracking-tight text-text">Tasks</h1>
            <p className="mt-1 text-sm text-text-secondary">Track work, priorities, and progress across your projects.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/tasks/new"
              className="nex-gradient inline-flex items-center justify-center px-5 py-3 rounded-xl shadow-lg shadow-violet-500/10 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + New task
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-text-secondary animate-pulse">Loading list...</div>}>
          <TasksListContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
