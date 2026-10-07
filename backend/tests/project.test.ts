import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';

describe('Project API', () => {
  let userA: any;
  let userB: any;
  let tokenA: string;
  let tokenB: string;
  let projectAId: string;

  beforeAll(async () => {
    // Cleanup any existing tests
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ['usera@project.test', 'userb@project.test'] } }
    });

    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    // Create users directly
    userA = await prisma.user.create({
      data: { fullName: 'User A', email: 'usera@project.test', passwordHash }
    });
    userB = await prisma.user.create({
      data: { fullName: 'User B', email: 'userb@project.test', passwordHash }
    });

    // Login users to get tokens
    const resA = await request(app).post('/api/auth/login').send({ email: 'usera@project.test', password: 'Password123!' });
    tokenA = resA.body.data.token;

    const resB = await request(app).post('/api/auth/login').send({ email: 'userb@project.test', password: 'Password123!' });
    tokenB = resB.body.data.token;
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ['usera@project.test', 'userb@project.test'] } }
    });
    await prisma.$disconnect();
  });

  describe('Authentication Enforcement', () => {
    it('1. GET projects without token -> 401', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
    });
    it('2. POST project without token -> 401', async () => {
      const res = await request(app).post('/api/projects').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
    it('3. GET project by ID without token -> 401', async () => {
      const res = await request(app).get('/api/projects/some-id');
      expect(res.status).toBe(401);
    });
    it('4. PUT project without token -> 401', async () => {
      const res = await request(app).put('/api/projects/some-id').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
    it('5. DELETE project without token -> 401', async () => {
      const res = await request(app).delete('/api/projects/some-id');
      expect(res.status).toBe(401);
    });
  });

  describe('CREATE Project', () => {
    it('6. Valid project creation -> success', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Project A', description: 'Desc', status: 'IN_PROGRESS' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.project.name).toBe('Project A');
      expect(res.body.data.project.userId).toBe(userA.id);
      projectAId = res.body.data.project.id;
    });
    it('7. Invalid name -> 400', async () => {
      const res = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: '' });
      expect(res.status).toBe(400);
    });
    it('8. Invalid status -> 400', async () => {
      const res = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Test', status: 'UNKNOWN' });
      expect(res.status).toBe(400);
    });
    it('9. Invalid date -> 400', async () => {
      const res = await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Test', startDate: 'not-a-date' });
      expect(res.status).toBe(400);
    });
    it('10. endDate before startDate -> 400', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Test', startDate: '2023-10-01T00:00:00.000Z', endDate: '2023-09-01T00:00:00.000Z' });
      expect(res.status).toBe(400);
    });
    it('11. Attempt to supply another userId cannot change ownership', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Malicious Project', userId: userB.id });
      expect(res.status).toBe(201);
      // Ensure it was still assigned to userA despite requesting userB
      expect(res.body.data.project.userId).toBe(userA.id);
    });
  });

  describe('READ Projects', () => {
    it('12. User can retrieve their own projects', async () => {
      const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBeGreaterThanOrEqual(2); // Project A + Malicious Project
      expect(res.body.data.projects[0].userId).toBe(userA.id);
    });
    it('13. User cannot retrieve another user\'s projects', async () => {
      const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(0); // User B has no projects
    });
    it('14. User can retrieve their own project by ID', async () => {
      const res = await request(app).get(`/api/projects/${projectAId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.project.id).toBe(projectAId);
    });
    it('15. User receives 404 for another user\'s project', async () => {
      const res = await request(app).get(`/api/projects/${projectAId}`).set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(404);
    });
    it('16. Invalid project UUID -> 400', async () => {
      const res = await request(app).get('/api/projects/not-a-uuid').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(400);
    });
  });

  describe('UPDATE Project', () => {
    it('17. Owner can update project', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Updated Project A' });
      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe('Updated Project A');
    });
    it('18 & 19. Non-owner cannot update project, returns 404', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hacked Project A' });
      expect(res.status).toBe(404);
    });
    it('20. Invalid update data -> 400', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: 'INVALID' });
      expect(res.status).toBe(400);
    });
    it('21. userId cannot be reassigned', async () => {
      const res = await request(app)
        .put(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ userId: userB.id });
      expect(res.status).toBe(200);
      // It should ignore the userId and remain under userA
      expect(res.body.data.project.userId).toBe(userA.id);
    });
  });

  describe('FILTERING', () => {
    beforeAll(async () => {
      // Create projects for filtering tests
      await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Delivery App', status: 'IN_PROGRESS' });
      await request(app).post('/api/projects').set('Authorization', `Bearer ${tokenA}`).send({ name: 'Web Portal', status: 'COMPLETED' });
    });

    it('26. Search by project name', async () => {
      const res = await request(app).get('/api/projects?search=delivery').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].name).toBe('Delivery App');
    });
    it('27. Filter by status', async () => {
      const res = await request(app).get('/api/projects?status=COMPLETED').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.projects.some((p: any) => p.name === 'Web Portal')).toBe(true);
      expect(res.body.data.projects.every((p: any) => p.status === 'COMPLETED')).toBe(true);
    });
    it('28. Combined search + status', async () => {
      const res = await request(app).get('/api/projects?search=app&status=IN_PROGRESS').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].name).toBe('Delivery App');
    });
    it('29. Invalid status filter -> 400', async () => {
      const res = await request(app).get('/api/projects?status=FAKE').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE Project', () => {
    it('23 & 24. Non-owner cannot delete project, returns 404', async () => {
      const res = await request(app).delete(`/api/projects/${projectAId}`).set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(404);
    });
    it('22 & 25. Owner can delete project, removes associated tasks (cascade)', async () => {
      // First create a task in the project (simulated raw via prisma since task API doesn't exist yet)
      const task = await prisma.task.create({
        data: { projectId: projectAId, userId: userA.id, name: 'Task to be deleted' }
      });
      
      const res = await request(app).delete(`/api/projects/${projectAId}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      
      // Verify project is gone
      const pCheck = await prisma.project.findUnique({ where: { id: projectAId }});
      expect(pCheck).toBeNull();

      // Verify task is gone (cascade worked)
      const tCheck = await prisma.task.findUnique({ where: { id: task.id }});
      expect(tCheck).toBeNull();
    });
  });
});
