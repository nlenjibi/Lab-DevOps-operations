const request = require('supertest');
process.env.NODE_ENV = 'test';

const app = require('../server');

describe('Tracing middleware', () => {
  test('assigns X-Request-Id header and response includes it', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty('x-request-id');
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});
