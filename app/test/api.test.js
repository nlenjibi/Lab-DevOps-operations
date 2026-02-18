const request = require('supertest');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

const app = require('../server');
const Todo = require('../models/Todo');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:root@localhost:27017/todoapp?authSource=admin';

describe('API /api/todos', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  }, 20000);

  beforeEach(async () => {
    await Todo.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('POST /api/todos creates a todo and returns 201', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ task: 'api test task' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.task).toBe('api test task');
  });

  test('GET /api/todos returns an array', async () => {
    // seed one
    const t1 = new Todo({ task: 'seed task', priority: 'high', completed: false });
    const t2 = new Todo({ task: 'seed task 2', priority: 'low', completed: true });
    await t1.save();
    await t2.save();

    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    // filter by completed=true
    const resCompleted = await request(app).get('/api/todos').query({ completed: 'true' });
    expect(resCompleted.status).toBe(200);
    expect(resCompleted.body.every(t => t.completed === true)).toBe(true);

    // filter by priority=high
    const resPriority = await request(app).get('/api/todos').query({ priority: 'high' });
    expect(resPriority.status).toBe(200);
    expect(resPriority.body.every(t => t.priority === 'high')).toBe(true);
  });
});
