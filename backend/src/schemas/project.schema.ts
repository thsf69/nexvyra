import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(255),
    description: z.string().max(2000).optional(),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.NOT_STARTED),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable()
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: 'endDate must not be before startDate',
    path: ['endDate']
  })
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    status: z.nativeEnum(ProjectStatus).optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable()
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: 'endDate must not be before startDate',
    path: ['endDate']
  })
});

export const projectQuerySchema = z.object({
  query: z.object({
    search: z.string().max(100).optional(),
    status: z.nativeEnum(ProjectStatus).optional()
  })
});
