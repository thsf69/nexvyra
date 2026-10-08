'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getProjects } from '@/lib/api/projects';
import { Project } from '@/types';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';

/* eslint-disable @typescript-eslint/no-explicit-any */

function ProjectsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const lastPushedSearch = React.useRef(initialSearch);
  const lastPushedStatus = React.useRef(initialStatus);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter) params.set('status', statusFilter);
      
      // Avoid pushing if the URL is already identical to what we want
      const currentQuery = searchParams.toString();
      const newQuery = params.toString();
      
      if (currentQuery !== newQuery) {
        lastPushedSearch.current = searchTerm;
        lastPushedStatus.current = statusFilter;
        router.push(`/projects${newQuery ? `?${newQuery}` : ''}`);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, router, searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || '';
    
    if (currentSearch !== lastPushedSearch.current) {
      setSearchTerm(currentSearch);
      lastPushedSearch.current = currentSearch;
    }
    if (currentStatus !== lastPushedStatus.current) {
      setStatusFilter(currentStatus);
      lastPushedStatus.current = currentStatus;
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError('');
      try {
        const search = searchParams.get('search') || undefined;
        const status = searchParams.get('status') || undefined;
        const res = await getProjects({ search, status });
        setProjects(res.data?.projects || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [searchParams]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <>
      <div className="bg-surface p-4 rounded-xl shadow-sm border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search projects</label>
            <input
              type="text"
              id="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div className="sm:w-64">
            <label htmlFor="status" className="sr-only">Filter by status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          {(searchTerm || statusFilter) && (
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
              getProjects({ 
                search: searchParams.get('search') || undefined, 
                status: searchParams.get('status') || undefined 
              })
                .then(res => setProjects(res.data?.projects || []))
                .catch((err: any) => setError(err.message || 'Failed to load projects'))
                .finally(() => setIsLoading(false));
            }}
            className="ml-4 px-3 py-1.5 border border-red-200 rounded-md shadow-sm text-sm font-medium text-red-700 bg-surface hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-text-secondary animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
          {searchTerm || statusFilter ? (
            <p className="text-text-secondary">No projects match your current filters.</p>
          ) : (
            <div>
              <p className="text-text-secondary mb-4">No projects yet.</p>
              <Link href="/projects/new" className="text-primary hover:text-primary font-medium">
                Create your first project to get started
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {projects.map((project) => (
              <li key={project.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-primary truncate">
                        {project.name}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <ProjectStatusBadge status={project.status} />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-text-secondary">
                          {project.description ? (
                            <span className="truncate max-w-xs">{project.description}</span>
                          ) : (
                            <span className="italic text-text-secondary">No description</span>
                          )}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-text-secondary sm:mt-0">
                        <p>
                          {new Date(project.startDate || '').toLocaleDateString()} &mdash; {new Date(project.endDate || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm text-primary hover:text-primary font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="text-sm text-text-secondary hover:text-text font-medium"
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

export default function ProjectsPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Projects</h1>
            <p className="mt-1 text-sm text-text-secondary">Manage your projects, track progress, and keep work organized.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/projects/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90"
            >
              Create Project
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-text-secondary animate-pulse">Loading list...</div>}>
          <ProjectsListContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
