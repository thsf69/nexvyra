import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { requireProjectOwnership } from '../services/authz.service';
import { ApiError, formatResponse } from '../utils/ApiError';
import { ProjectStatus } from '@prisma/client';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { search, status } = req.query;

    const whereClause: any = { userId };

    if (search) {
      whereClause.name = {
        contains: String(search),
        mode: 'insensitive' // case-insensitive search in postgres
      };
    }

    if (status) {
      whereClause.status = status as ProjectStatus;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(formatResponse(true, 'Projects retrieved successfully', { projects }));
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    // enforces ownership and handles 404
    const project = await requireProjectOwnership(userId, id);

    res.json(formatResponse(true, 'Project retrieved successfully', { project }));
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { name, description, status, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        userId,
        name,
        description,
        status: status || ProjectStatus.NOT_STARTED,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.status(201).json(formatResponse(true, 'Project created successfully', { project }));
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { name, description, status, startDate, endDate } = req.body;

    // Ensure it exists and belongs to user
    const existingProject = await requireProjectOwnership(userId, id);

    // If both start and end dates aren't fully provided in this payload,
    // we should validate against the existing ones if we are setting one of them.
    // However, the schema validation already checked if both are in payload. 
    // To be perfectly safe against DB constraints, we can do a secondary check here.
    const finalStartDate = startDate !== undefined ? (startDate ? new Date(startDate) : null) : existingProject.startDate;
    const finalEndDate = endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingProject.endDate;

    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
      return next(new ApiError(400, 'Validation failed', [{ field: 'endDate', message: 'endDate must not be before startDate' }]));
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    res.json(formatResponse(true, 'Project updated successfully', { project: updatedProject }));
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;

    // enforce ownership
    await requireProjectOwnership(userId, id);

    await prisma.project.delete({
      where: { id }
    });

    res.json(formatResponse(true, 'Project deleted successfully'));
  } catch (error) {
    next(error);
  }
};
