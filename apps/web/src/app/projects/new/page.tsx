'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ProjectForm, ProjectFormData } from '@/components/projects/ProjectForm';
import { createProject } from '@/lib/api/projects';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const res = await createProject(data);
      if (res.success && res.data?.project) {
        // Redirect to detail page
        router.push(`/projects/${res.data.project.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-8">Create Project</h1>
        <ProjectForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Project"
        />
      </div>
    </AppShell>
  );
}
