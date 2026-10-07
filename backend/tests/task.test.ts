import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';

describe('Task API', () => {
  let userA: any;
  let userB: any;
  let tokenA: string;
  let tokenB: string;
  let projectA: any;
  let projectB: any;
  let taskAId: string;

  beforeAll(async () => {
    // Cleanup any existing tests
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ['usera@task.test', 'userb@task.test'] } }
    });

    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    // Create users directly
    userA = await prisma.user.create({
      data: { fullName: 'User A', email: 'usera@task.test', passwordHash }
    });
    userB = await prisma.user.create({
      data: { fullName: 'User B', email: 'userb@task.test', passwordHash }
    });

    // Login users to get tokens
    const resA = await request(app).post('/api/auth/login').send({ email: 'usera@task.test', password: 'Password123!' });
    tokenA = resA.body.data.token;

    const resB = await request(app).post('/api/auth/login').send({ email: 'userb@task.test', password: 'Password123!' });
    tokenB = resB.body.data.token;

    // Create projects directly
    projectA = await prisma.project.create({
      data: { name: 'Project A', userId: userA.id }
    });
    projectB = await prisma.project.create({
      data: { name: 'Project B', userId: userB.id }
    });
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ['usera@task.test', 'userb@task.test'] } }
    });
    await prisma.$disconnect();
  });

  describe('Authentication Enforcement', () => {
    it('1. GET tasks without token -> 401', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
    });
    it('2. POST task without token -> 401', async () => {
      const res = await request(app).post('/api/tasks').send({ name: 'Test', projectId: projectA.id });
      expect(res.status).toBe(401);
    });
    it('3. GET task by ID without token -> 401', async () => {
      const res = await request(app).get('/api/tasks/some-id');
      expect(res.status).toBe(401);
    });
    it('4. PUT task without token -> 401', async () => {
      const res = await request(app).put('/api/tasks/some-id').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
    it('5. DELETE task without token -> 401', async () => {
      const res = await request(app).delete('/api/tasks/some-id');
      expect(res.status).toBe(401);
    });
  });

  describe('CREATE Task & Project Ownership', () => {
    it('6 & 13. Valid task creation in own project -> success', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ projectId: projectA.id, name: 'Task A', description: 'Desc', priority: 'HIGH', status: 'PENDING' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.name).toBe('Task A');
      expect(res.body.data.task.userId).toBe(userA.id);
      expect(res.body.data.task.projectId).toBe(projectA.id);
      taskAId = res.body.data.task.id;
    });
    it('7. Invalid projectId -> 400', async () => {
      const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ projectId: 'not-a-uuid', name: 'Task' });
      expect(res.status).toBe(400);
    });
    it('8. Invalid name -> 400', async () => {
      const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ projectId: projectA.id, name: '' });
      expect(res.status).toBe(400);
    });
    it('9. Invalid priority -> 400', async () => {
      const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ projectId: projectA.id, name: 'Task', priority: 'FAKE' });
      expect(res.status).toBe(400);
    });
    it('10. Invalid status -> 400', async () => {
      const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ projectId: projectA.id, name: 'Task', status: 'FAKE' });
      expect(res.status).toBe(400);
    });
    it('11. Invalid dueDate -> 400', async () => {
      const res = await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ projectId: projectA.id, name: 'Task', dueDate: 'invalid-date' });
      expect(res.status).toBe(400);
    });
    it('12. Client-supplied userId cannot hijack ownership', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ projectId: projectA.id, name: 'Hijack Task', userId: userB.id });
      expect(res.status).toBe(201);
      expect(res.body.data.task.userId).toBe(userA.id);
    });
    it('14 & 15. Cross-user project task creation returns 404', async () => {
      // User B attempting to create task in User A's project
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ projectId: projectA.id, name: 'Sneaky Task' });
      expect(res.status).toBe(404);
    });
    it('16. No task is created after failed cross-user attempt', async () => {
      const tasks = await prisma.task.findMany({ where: { name: 'Sneaky Task' } });
      expect(tasks.length).toBe(0);
    });
  });

  describe('READ Tasks', () => {
    it('17. User can retrieve own tasks', async () => {
      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.tasks[0].userId).toBe(userA.id);
    });
    it('18. User cannot retrieve another user\'s tasks', async () => {
      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(0);
    });
    it('19. Own task by ID -> success', async () => {
      const res = await request(app).get(`/api/tasks/${taskAId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.task.id).toBe(taskAId);
    });
    it('20 & 38. Other user\'s task by ID -> 404 (Cross-user task access returns 404)', async () => {
      const res = await request(app).get(`/api/tasks/${taskAId}`).set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(404);
    });
    it('21. Invalid task UUID -> 400', async () => {
      const res = await request(app).get('/api/tasks/not-a-uuid').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(400);
    });
  });

  describe('UPDATE Task', () => {
    it('22. Owner can update task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Updated Task A' });
      expect(res.status).toBe(200);
      expect(res.body.data.task.name).toBe('Updated Task A');
    });
    it('23. Owner can mark task COMPLETED', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: 'COMPLETED' });
      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('COMPLETED');
    });
    it('24 & 25. Non-owner cannot update task -> 404', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hacked Task A' });
      expect(res.status).toBe(404);
    });
    it('26. userId cannot be reassigned', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ userId: userB.id });
      expect(res.status).toBe(200);
      expect(res.body.data.task.userId).toBe(userA.id);
    });
    it('27. projectId cannot be reassigned', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ projectId: projectB.id });
      expect(res.status).toBe(200);
      expect(res.body.data.task.projectId).toBe(projectA.id);
    });
  });

  describe('FILTERING & SECURITY', () => {
    beforeAll(async () => {
      // Create additional tasks for User A
      await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ projectId: projectA.id, name: 'API Task', status: 'IN_PROGRESS', priority: 'HIGH' });
      await request(app).post('/api/tasks').set('Authorization', `Bearer ${tokenA}`).send({ projectId: projectA.id, name: 'Database Task', status: 'PENDING', priority: 'LOW' });
    });

    it('31. Search by task name', async () => {
      const res = await request(app).get('/api/tasks?search=API').set('Authorization', `Bearer ${tokenA}`);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].name).toBe('API Task');
    });
    it('32. Filter by status', async () => {
      const res = await request(app).get('/api/tasks?status=IN_PROGRESS').set('Authorization', `Bearer ${tokenA}`);
      expect(res.body.data.tasks.every((t: any) => t.status === 'IN_PROGRESS')).toBe(true);
    });
    it('33. Filter by priority', async () => {
      const res = await request(app).get('/api/tasks?priority=LOW').set('Authorization', `Bearer ${tokenA}`);
      expect(res.body.data.tasks.every((t: any) => t.priority === 'LOW')).toBe(true);
    });
    it('34. Combined status + priority', async () => {
      const res = await request(app).get('/api/tasks?status=IN_PROGRESS&priority=HIGH').set('Authorization', `Bearer ${tokenA}`);
      expect(res.body.data.tasks.length).toBe(1);
    });
    it('35. Combined search + status + priority', async () => {
      const res = await request(app).get('/api/tasks?search=API&status=IN_PROGRESS&priority=HIGH').set('Authorization', `Bearer ${tokenA}`);
      expect(res.body.data.tasks.length).toBe(1);
    });
    it('36. Invalid status filter -> 400', async () => {
      const res = await request(app).get('/api/tasks?status=INVALID').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(400);
    });
    it('37. Invalid priority filter -> 400', async () => {
      const res = await request(app).get('/api/tasks?priority=INVALID').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(400);
    });
    it('39. Cross-user task search never exposes task', async () => {
      const res = await request(app).get('/api/tasks?search=API').set('Authorization', `Bearer ${tokenB}`);
      expect(res.body.data.tasks.length).toBe(0);
    });
    it('40. Cross-user priority filtering never exposes task', async () => {
      const res = await request(app).get('/api/tasks?priority=HIGH').set('Authorization', `Bearer ${tokenB}`);
      expect(res.body.data.tasks.length).toBe(0);
    });
    it('41. Cross-user status filtering never exposes task', async () => {
      const res = await request(app).get('/api/tasks?status=IN_PROGRESS').set('Authorization', `Bearer ${tokenB}`);
      expect(res.body.data.tasks.length).toBe(0);
    });
    it('42. No sensitive information in responses', async () => {
      const res = await request(app).get(`/api/tasks/${taskAId}`).set('Authorization', `Bearer ${tokenA}`);
      const text = JSON.stringify(res.body);
      expect(text).not.toContain('passwordHash');
    });
  });

  describe('DELETE Task', () => {
    it('29 & 30. Non-owner cannot delete task -> 404', async () => {
      const res = await request(app).delete(`/api/tasks/${taskAId}`).set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(404);
    });
    it('28. Owner can delete task', async () => {
      const res = await request(app).delete(`/api/tasks/${taskAId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      
      // Verify gone
      const check = await prisma.task.findUnique({ where: { id: taskAId } });
      expect(check).toBeNull();
    });
  });
});
