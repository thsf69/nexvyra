import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { requireTaskOwnership, requireProjectOwnership } from '../services/authz.service';
import { ApiError, formatResponse } from '../utils/ApiError';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { search, status, priority } = req.query;

    const whereClause: any = { userId };

    if (search) {
      whereClause.name = {
        contains: String(search),
        mode: 'insensitive' // case-insensitive search
      };
    }

    if (status) {
      whereClause.status = status as TaskStatus;
    }

    if (priority) {
      whereClause.priority = priority as TaskPriority;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(formatResponse(true, 'Tasks retrieved successfully', { tasks }));
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    const task = await requireTaskOwnership(userId, id);

    res.json(formatResponse(true, 'Task retrieved successfully', { task }));
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { projectId, name, description, priority, status, dueDate } = req.body;

    // CRITICAL: verify that the project exists and belongs to the authenticated user.
    // If it doesn't, this throws a 404, denying task creation and preventing ID leakage.
    await requireProjectOwnership(userId, projectId);

    const task = await prisma.task.create({
      data: {
        projectId,
        userId,
        name,
        description,
        priority: priority || TaskPriority.MEDIUM,
        status: status || TaskStatus.PENDING,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    res.status(201).json(formatResponse(true, 'Task created successfully', { task }));
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { name, description, priority, status, dueDate } = req.body;

    // Verify task exists and belongs to user
    await requireTaskOwnership(userId, id);

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null })
      }
    });

    res.json(formatResponse(true, 'Task updated successfully', { task: updatedTask }));
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    // Verify ownership
    await requireTaskOwnership(userId, id);

    await prisma.task.delete({
      where: { id }
    });

    res.json(formatResponse(true, 'Task deleted successfully'));
  } catch (error) {
    next(error);
  }
};
