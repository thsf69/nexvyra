/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getProject, deleteProject } from '@/lib/api/projects';
import { getTasks } from '@/lib/api/tasks';
import { Project, Task } from '@/types';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          getProject(params.id),
          getTasks({ projectId: params.id })
        ]);
        setProject(projectRes.data?.project || null);
        setTasks(tasksRes.data?.tasks || []);
      } catch (err: any) {
        setError(err.status === 404 ? 'Project not found.' : err.message || 'Failed to load details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This will also delete all associated tasks immediately and cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteProject(params.id);
      router.push('/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to delete project.');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-8 text-center text-text-secondary animate-pulse">Loading project...</div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl">
        {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">{error}</div>}
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-300">
            {error || 'Project not found.'}
          </div>
          <div className="mt-4">
            <Link href="/projects" className="text-primary hover:text-primary font-medium">&larr; Back to Projects</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/projects" className="text-primary hover:text-primary font-medium text-sm">
            &larr; Back to Projects
          </Link>
        </div>

        <div className="nex-glass mb-8 overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-7 sm:px-8">
            <div>
              <h3 className="break-words text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl">{project.name}</h3>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          <div className="space-y-7 border-t border-border/70 px-5 py-6 sm:px-8 sm:py-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[.14em] text-text-secondary">Description</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text">
                {project.description || <span className="italic text-text-secondary">No description provided.</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/50 p-5">
                <h4 className="text-xs font-bold uppercase tracking-[.14em] text-text-secondary">Start Date</h4>
                <p className="mt-1 text-sm text-text">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/50 p-5">
                <h4 className="text-xs font-bold uppercase tracking-[.14em] text-text-secondary">End Date</h4>
                <p className="mt-1 text-sm text-text">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border/70 pt-6">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/20 disabled:opacity-60 dark:text-red-300"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
              <Link
                href={`/projects/${project.id}/edit`}
                className="nex-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Edit Project
              </Link>
            </div>
          </div>
        </div>

        {/* Phase 11 Task View */}
        <div className="nex-glass overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-5 sm:px-8">
            <h3 className="text-lg font-bold tracking-tight text-text">Tasks</h3>
            <div className="flex space-x-3">
              <Link href={`/tasks?projectId=${project.id}`} className="text-sm text-text-secondary hover:text-text font-medium py-1">
                View All
              </Link>
              <Link
                href={`/tasks/new?projectId=${project.id}`}
                className="inline-flex items-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                Create Task
              </Link>
            </div>
          </div>
          {tasks.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-text-secondary mb-2">No tasks in this project yet.</p>
              <Link href={`/tasks/new?projectId=${project.id}`} className="text-primary hover:text-primary text-sm font-medium">
                Create one now
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {tasks.map((task) => (
                <li key={task.id} className="px-5 py-4 transition hover:bg-primary/5 sm:px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate mb-1">
                        <Link href={`/tasks/${task.id}`}>
                          {task.name}
                        </Link>
                      </p>
                      <div className="flex items-center text-sm text-text-secondary space-x-2">
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        <span className="hidden sm:inline">&bull; Due: {new Date(task.dueDate || "").toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-text-secondary hover:text-text">
                        View
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
