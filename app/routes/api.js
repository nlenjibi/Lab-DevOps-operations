const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');

const router = express.Router();

// GET /api/todos
router.get('/todos', async (req, res, next) => {
  try {
    const filter = {};
    // filter by completed status
    if (req.query.completed !== undefined) {
      const v = req.query.completed.toLowerCase();
      if (v === 'true' || v === 'false') filter.completed = v === 'true';
    }
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;

    const todos = await Todo.find(filter);
    res.json(todos);
  } catch (e) {
    next(e);
  }
});

// POST /api/todos
router.post(
  '/todos',
  body('task').trim().notEmpty().withMessage('Task is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newTodo = new Todo({
          task: req.body.task,
          completed: req.body.completed === undefined ? false : req.body.completed,
          priority: req.body.priority || 'medium',
          dueDate: req.body.dueDate || null,
          category: req.body.category || null
        });
      const saved = await newTodo.save();
      res.status(201).json(saved);
    } catch (e) {
      next(e);
    }
  }
);

// PATCH /api/todos/:id
router.patch('/todos/:id', async (req, res, next) => {
  try {
    const update = {};
    if (req.body.task !== undefined) update.task = req.body.task;
    if (req.body.completed !== undefined) update.completed = req.body.completed;

    const updated = await Todo.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});



module.exports = router;
