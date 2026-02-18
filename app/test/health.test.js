const request = require('supertest');
process.env.NODE_ENV = 'test';

const app = require('../server');

describe('Health endpoint', () => {
  test('GET /health returns 200 and JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
  });
});
