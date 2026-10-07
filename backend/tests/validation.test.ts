import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { validateRequest } from '../src/middleware/validate';
import { uuidParamSchema } from '../src/schemas/common.schema';
import { errorHandler } from '../src/middleware/errorHandler';

describe('ID Validation Security', () => {
  const app = express();
  
  app.get('/test/:id', validateRequest(uuidParamSchema), (req, res) => {
    res.json({ success: true, id: req.params.id });
  });

  app.use(errorHandler); // Use our global error handler to ensure no stack traces leak

  it('should allow valid UUIDs', async () => {
    const validId = 'd89c6d48-6a34-4b52-9b2c-62be16e10223';
    const res = await request(app).get(`/test/${validId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject malformed IDs with 400 and structured error (no stack trace)', async () => {
    const res = await request(app).get('/test/invalid-id-format');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].field).toBe('params.id');
    // Ensure no stack trace leaks
    expect(res.text).not.toContain('stack');
    expect(res.text).not.toContain('Error:');
  });
});
