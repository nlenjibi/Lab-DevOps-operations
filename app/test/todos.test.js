const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

const app = require('../server');
const Todo = require('../models/Todo');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:root@localhost:27017/todoapp?authSource=admin';

describe('Todos integration (model + DB)', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  }, 20000);

  beforeEach(async () => {
    await Todo.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('create a todo (model) and verify persistence', async () => {
    const t = new Todo({ task: 'integration test task' });
    const saved = await t.save();
    expect(saved).toHaveProperty('_id');
    expect(saved.task).toBe('integration test task');
  });

  test('GET /health still returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
