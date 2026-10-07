import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';

describe('Authentication API', () => {
  const testUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'Password123!'
  };

  let authToken: string;

  beforeAll(async () => {
    // Clean up test user if exists
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should fail registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toBe('Invalid email address');
    });

    it('should successfully register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Should never return hash
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject non-existent account', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@example.com', password: 'Password123!' });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should reject incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword123!' });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should successfully login and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
      
      authToken = res.body.data.token;
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Authentication token missing or invalid');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-xyz');
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid authentication token');
    });

    it('should successfully return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return logout success message', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Client must remove token');
    });
  });

  describe('GET /api/health', () => {
    it('existing health endpoint still works', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
