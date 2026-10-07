import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid project ID format'),
    name: z.string().min(1, 'Task name is required').max(255),
    description: z.string().max(2000).optional(),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
    dueDate: z.string().datetime().optional().nullable()
  })
});

export const updateTaskSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Task name is required').max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    dueDate: z.string().datetime().optional().nullable()
  })
});

export const taskQuerySchema = z.object({
  query: z.object({
    search: z.string().max(100).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional()
  })
});
