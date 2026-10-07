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
        <div className="max-w-4xl mx-auto p-8 text-center text-gray-500 animate-pulse">Loading project...</div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 text-red-700 bg-red-50 rounded-md border border-red-100">
            {error || 'Project not found.'}
          </div>
          <div className="mt-4">
            <Link href="/projects" className="text-indigo-600 hover:text-indigo-900 font-medium">&larr; Back to Projects</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/projects" className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">
            &larr; Back to Projects
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900 break-words">{project.name}</h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {project.description || <span className="italic text-gray-400">No description provided.</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                <p className="mt-1 text-sm text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                <p className="mt-1 text-sm text-gray-900">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 mt-6 flex justify-end space-x-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-70"
              >
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
              <Link
                href={`/projects/${project.id}/edit`}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Edit Project
              </Link>
            </div>
          </div>
        </div>

        {/* Phase 11 Task View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Tasks</h3>
            <div className="flex space-x-3">
              <Link href={`/tasks?projectId=${project.id}`} className="text-sm text-gray-600 hover:text-gray-900 font-medium py-1">
                View All
              </Link>
              <Link
                href={`/tasks/new?projectId=${project.id}`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Create Task
              </Link>
            </div>
          </div>
          {tasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-2">No tasks in this project yet.</p>
              <Link href={`/tasks/new?projectId=${project.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                Create one now
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate mb-1">
                        <Link href={`/tasks/${task.id}`}>
                          {task.name}
                        </Link>
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        <span className="hidden sm:inline">&bull; Due: {new Date(task.dueDate || "").toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
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
