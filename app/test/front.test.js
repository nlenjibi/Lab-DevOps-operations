const request = require('supertest');
// Ensure test environment
process.env.NODE_ENV = 'test';

// Mock the Todo model to avoid DB dependency
jest.mock('../models/Todo', () => {
  const m = function (obj) {
    this.task = obj.task;
    this.save = jest.fn().mockResolvedValue(this);
  };
  m.find = jest.fn();
  m.findOneAndRemove = jest.fn();
  return m;
});

const Todo = require('../models/Todo');
const app = require('../server');

describe('Front routes (HTML)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('GET / returns 200 and renders HTML', async () => {
    Todo.find.mockResolvedValue([{ _id: '1', task: 'Test', createdAt: new Date(), completed: false }]);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  test('POST / creates todo and redirects to /', async () => {
    const res = await request(app)
      .post('/')
      .send('task=New+Task')
      .set('Content-Type', 'application/x-www-form-urlencoded');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });
});
