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
      <div className="nex-glass p-4 sm:p-5 rounded-2xl border border-border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search projects</label>
            <input
              type="text"
              id="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border border-border bg-background/70 text-text rounded-xl py-3 px-4 outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm"
            />
          </div>
          <div className="sm:w-64">
            <label htmlFor="status" className="sr-only">Filter by status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border border-border bg-background/70 text-text rounded-xl py-3 px-4 outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary sm:text-sm"
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
        <div className="nex-glass rounded-2xl text-center py-12 text-text-secondary animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="nex-glass rounded-2xl border border-dashed border-border p-12 text-center">
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
        <div className="nex-glass rounded-2xl border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {projects.map((project) => (
              <li key={project.id}>
                <div className="px-4 py-5 sm:px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-primary/5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-text truncate">
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
                          {(project.startDate ? new Date(project.startDate).toLocaleDateString() : "No start date")} &mdash; {(project.endDate ? new Date(project.endDate).toLocaleDateString() : "No end date")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="sm:ml-5 flex-shrink-0 flex gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                    >
                      View
                    </Link>
                    <Link
                      href={`/projects/${project.id}/edit`}
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

export default function ProjectsPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-7">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-primary">Workspace / Portfolio</p>
            <h1 className="text-3xl font-bold tracking-tight text-text">Projects</h1>
            <p className="mt-1 text-sm text-text-secondary">Manage your projects, track progress, and keep work organized.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/projects/new"
              className="nex-gradient inline-flex items-center justify-center px-5 py-3 rounded-xl shadow-lg shadow-violet-500/10 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + New project
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
