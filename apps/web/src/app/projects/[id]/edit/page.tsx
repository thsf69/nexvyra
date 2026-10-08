/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ProjectForm, ProjectFormData } from '@/components/projects/ProjectForm';
import { getProject, updateProject } from '@/lib/api/projects';
import { Project } from '@/types';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await getProject(params.id);
        setProject(res.data?.project || null);
      } catch (err: any) {
        setError(err.status === 404 ? 'Project not found.' : err.message || 'Failed to load project.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [params.id]);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await updateProject(params.id, data);
      router.push(`/projects/${params.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto p-8 text-center text-text-secondary animate-pulse">Loading project...</div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto p-4 text-red-700 bg-red-50 rounded-md border border-red-100">
          {error || 'Project not found.'}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-8">Edit Project</h1>
        <ProjectForm
          initialData={project}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
        />
      </div>
    </AppShell>
  );
}
