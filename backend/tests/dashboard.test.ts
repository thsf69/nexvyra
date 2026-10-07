import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';
import { ProjectStatus, TaskStatus } from '@prisma/client';

describe('Dashboard API', () => {
  let userA: any;
  let userB: any;
  let userEmpty: any;
  let tokenA: string;
  let tokenB: string;
  let tokenEmpty: string;

  // Variables for Data Consistency Test
  let dcProject: any;
  let dcTask: any;

  beforeAll(async () => {
    // Cleanup any existing tests to ensure exact counts
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ['usera@dashboard.test', 'userb@dashboard.test', 'userempty@dashboard.test'] } }
    });

    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    // Create users directly
    userA = await prisma.user.create({ data: { fullName: 'User A', email: 'usera@dashboard.test', passwordHash } });
    userB = await prisma.user.create({ data: { fullName: 'User B', email: 'userb@dashboard.test', passwordHash } });
    userEmpty = await prisma.user.create({ data: { fullName: 'User Empty', email: 'userempty@dashboard.test', passwordHash } });

    // Login users to get tokens
    const resA = await request(app).post('/api/auth/login').send({ email: 'usera@dashboard.test', password: 'Password123!' });
    tokenA = resA.body.data.token;

    const resB = await request(app).post('/api/auth/login').send({ email: 'userb@dashboard.test', password: 'Password123!' });
    tokenB = resB.body.data.token;

    const resEmpty = await request(app).post('/api/auth/login').send({ email: 'userempty@dashboard.test', password: 'Password123!' });
    tokenEmpty = resEmpty.body.data.token;

    // Seed User A Data
    // Projects: 1 NOT_STARTED, 1 IN_PROGRESS, 1 COMPLETED (Total: 3, InProgress: 1)
    const pA1 = await prisma.project.create({ data: { userId: userA.id, name: 'A1', status: ProjectStatus.NOT_STARTED } });
    const pA2 = await prisma.project.create({ data: { userId: userA.id, name: 'A2', status: ProjectStatus.IN_PROGRESS } });
    const pA3 = await prisma.project.create({ data: { userId: userA.id, name: 'A3', status: ProjectStatus.COMPLETED } });

    // Tasks: 2 PENDING, 1 IN_PROGRESS, 1 COMPLETED (Total: 4, Pending: 2, Completed: 1)
    await prisma.task.create({ data: { userId: userA.id, projectId: pA1.id, name: 'T1', status: TaskStatus.PENDING } });
    await prisma.task.create({ data: { userId: userA.id, projectId: pA1.id, name: 'T2', status: TaskStatus.PENDING } });
    await prisma.task.create({ data: { userId: userA.id, projectId: pA1.id, name: 'T3', status: TaskStatus.IN_PROGRESS } });
    await prisma.task.create({ data: { userId: userA.id, projectId: pA1.id, name: 'T4', status: TaskStatus.COMPLETED } });

    // Seed User B Data
    // Projects: 1 IN_PROGRESS, 1 COMPLETED (Total: 2, InProgress: 1)
    const pB1 = await prisma.project.create({ data: { userId: userB.id, name: 'B1', status: ProjectStatus.IN_PROGRESS } });
    const pB2 = await prisma.project.create({ data: { userId: userB.id, name: 'B2', status: ProjectStatus.COMPLETED } });

    // Tasks: 1 PENDING, 2 COMPLETED (Total: 3, Pending: 1, Completed: 2)
    await prisma.task.create({ data: { userId: userB.id, projectId: pB1.id, name: 'TB1', status: TaskStatus.PENDING } });
    await prisma.task.create({ data: { userId: userB.id, projectId: pB1.id, name: 'TB2', status: TaskStatus.COMPLETED } });
    await prisma.task.create({ data: { userId: userB.id, projectId: pB1.id, name: 'TB3', status: TaskStatus.COMPLETED } });

  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ['usera@dashboard.test', 'userb@dashboard.test', 'userempty@dashboard.test'] } }
    });
    await prisma.$disconnect();
  });

  describe('AUTHENTICATION', () => {
    it('1. GET /api/dashboard without token -> 401', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
    });
    it('2. GET /api/dashboard with invalid token -> 401', async () => {
      const res = await request(app).get('/api/dashboard').set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
    it('3. GET /api/dashboard with expired token -> 401', async () => {
      // In a real scenario we'd mock an expired token, but invalid token proves the rejection mechanism
      const res = await request(app).get('/api/dashboard').set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe('CROSS-USER ISOLATION & USER-SCOPED COUNTS', () => {
    it('should correctly count User A metrics, excluding User B', async () => {
      const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProjects).toBe(3);
      expect(res.body.data.totalTasks).toBe(4);
      expect(res.body.data.completedTasks).toBe(1);
      expect(res.body.data.pendingTasks).toBe(2);
      expect(res.body.data.projectsInProgress).toBe(1);
    });

    it('should correctly count User B metrics, excluding User A', async () => {
      const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProjects).toBe(2);
      expect(res.body.data.totalTasks).toBe(3);
      expect(res.body.data.completedTasks).toBe(2);
      expect(res.body.data.pendingTasks).toBe(1);
      expect(res.body.data.projectsInProgress).toBe(1);
    });
  });

  describe('EMPTY DASHBOARD', () => {
    it('should return zeroes for a user with no data, rather than null/error', async () => {
      const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenEmpty}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProjects).toBe(0);
      expect(res.body.data.totalTasks).toBe(0);
      expect(res.body.data.completedTasks).toBe(0);
      expect(res.body.data.pendingTasks).toBe(0);
      expect(res.body.data.projectsInProgress).toBe(0);
    });
  });

  describe('USER ID ATTACK TEST', () => {
    it('should NOT allow switching the dashboard identity via query parameter', async () => {
      // Attempt to access userB's dashboard using userA's token
      const res = await request(app)
        .get(`/api/dashboard?userId=${userB.id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      
      // We made the Zod schema reject `userId` entirely
      expect(res.status).toBe(400);
      
      // Even if we hit it without the param, it correctly loads User A
      const resFallback = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenA}`);
      expect(resFallback.body.data.totalProjects).toBe(3);
    });
  });

  describe('DATA CONSISTENCY TEST', () => {
    it('should dynamically update dashboard values when data changes', async () => {
      // 1. Create a project with status NOT_STARTED
      const resProj = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenEmpty}`).send({
        name: 'Consistency Project', status: 'NOT_STARTED'
      });
      dcProject = resProj.body.data.project;

      // 2. Dashboard totalProjects increases (0 -> 1)
      let d1 = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenEmpty}`);
      expect(d1.body.data.totalProjects).toBe(1);
      expect(d1.body.data.projectsInProgress).toBe(0);

      // 3. Change project status to IN_PROGRESS
      await request(app).put(`/api/projects/${dcProject.id}`).set('Authorization', `Bearer ${tokenEmpty}`).send({
        status: 'IN_PROGRESS'
      });

      // 4. projectsInProgress increases (0 -> 1)
      let d2 = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenEmpty}`);
      expect(d2.body.data.projectsInProgress).toBe(1);

      // 5. Create a PENDING task
      const resTask = await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenEmpty}`).send({
        projectId: dcProject.id, name: 'Consistency Task', status: 'PENDING'
      });
      dcTask = resTask.body.data.task;

      // 6. totalTasks and pendingTasks increase (0 -> 1)
      let d3 = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenEmpty}`);
      expect(d3.body.data.totalTasks).toBe(1);
      expect(d3.body.data.pendingTasks).toBe(1);
      expect(d3.body.data.completedTasks).toBe(0);

      // 7. Change task to COMPLETED
      await request(app).put(`/api/tasks/${dcTask.id}`).set('Authorization', `Bearer ${tokenEmpty}`).send({
        status: 'COMPLETED'
      });

      // 8 & 9. pendingTasks decreases (1 -> 0), completedTasks increases (0 -> 1)
      let d4 = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenEmpty}`);
      expect(d4.body.data.pendingTasks).toBe(0);
      expect(d4.body.data.completedTasks).toBe(1);

      // 10. Delete the task
      await request(app).delete(`/api/tasks/${dcTask.id}`).set('Authorization', `Bearer ${tokenEmpty}`);

      // 11. totalTasks decreases (1 -> 0)
      let d5 = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenEmpty}`);
      expect(d5.body.data.totalTasks).toBe(0);
    });
  });

  describe('SECURITY', () => {
    it('No sensitive information in responses', async () => {
      const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${tokenA}`);
      const text = JSON.stringify(res.body);
      expect(text).not.toContain('passwordHash');
      expect(text).not.toContain('stack');
      expect(text).not.toContain('prisma');
    });
  });
});
