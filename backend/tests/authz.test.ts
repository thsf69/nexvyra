import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import prisma from '../src/config/prisma';
import { requireProjectOwnership, requireTaskOwnership } from '../src/services/authz.service';
import { ApiError } from '../src/utils/ApiError';

describe('Authorization Service', () => {
  let userA: any;
  let userB: any;
  let projectA: any;
  let taskA: any;

  beforeAll(async () => {
    // Clear potentially conflicting data
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Setup Test Users
    userA = await prisma.user.create({
      data: {
        fullName: 'User A',
        email: 'userA@example.com',
        passwordHash: 'hashed123'
      }
    });

    userB = await prisma.user.create({
      data: {
        fullName: 'User B',
        email: 'userB@example.com',
        passwordHash: 'hashed123'
      }
    });

    // Setup User A's Project & Task
    projectA = await prisma.project.create({
      data: {
        name: 'Project A',
        userId: userA.id,
      }
    });

    taskA = await prisma.task.create({
      data: {
        name: 'Task A',
        projectId: projectA.id,
        userId: userA.id
      }
    });
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('requireProjectOwnership', () => {
    it('should allow access to own project', async () => {
      const result = await requireProjectOwnership(userA.id, projectA.id);
      expect(result.id).toBe(projectA.id);
    });

    it('should deny access to another user\'s project with a 404', async () => {
      await expect(requireProjectOwnership(userB.id, projectA.id)).rejects.toThrow(
        new ApiError(404, 'Project not found')
      );
    });

    it('should deny access to non-existent project with a 404', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(requireProjectOwnership(userA.id, fakeId)).rejects.toThrow(
        new ApiError(404, 'Project not found')
      );
    });
  });

  describe('requireTaskOwnership', () => {
    it('should allow access to own task', async () => {
      const result = await requireTaskOwnership(userA.id, taskA.id);
      expect(result.id).toBe(taskA.id);
    });

    it('should deny access to another user\'s task with a 404', async () => {
      await expect(requireTaskOwnership(userB.id, taskA.id)).rejects.toThrow(
        new ApiError(404, 'Task not found')
      );
    });

    it('should deny access to non-existent task with a 404', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(requireTaskOwnership(userA.id, fakeId)).rejects.toThrow(
        new ApiError(404, 'Task not found')
      );
    });
  });
});
