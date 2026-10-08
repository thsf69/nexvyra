'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { TaskForm, TaskFormData } from '@/components/tasks/TaskForm';
import { createTask } from '@/lib/api/tasks';

function NewTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const res = await createTask(data);
      if (res.success && res.data?.task) {
        if (projectId) {
          router.push(`/projects/${projectId}`);
        } else {
          router.push(`/tasks/${res.data.task.id}`);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TaskForm
      initialProjectId={projectId || ''}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Create Task"
    />
  );
}

export default function NewTaskPage() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text mb-8">Create Task</h1>
        <Suspense fallback={<div className="p-8 text-center text-text-secondary animate-pulse">Loading form...</div>}>
          <NewTaskContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
