const express = require('express');
const Todo = require('./../models/Todo');

const router = express.Router();

// Home page route
router.get('/', async (req, res) => {

    const todos = await Todo.find();
    res.render("todos", {
        tasks: (Object.keys(todos).length > 0 ? todos : {})
    });
});

const { body, validationResult } = require('express-validator');

// POST - Submit Task
router.post(
    '/',
    body('task').trim().notEmpty().withMessage('Task is required'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const err = new Error('Validation failed');
            err.status = 400;
            err.details = errors.array();
            return next(err);
        }

        try {
            const newTask = new Todo({
                task: req.body.task
            });

            await newTask.save();
            return res.redirect('/');
        } catch (e) {
            return next(e);
        }
    }
);

// POST - Destroy todo item
router.post('/todo/destroy', async (req, res) => {
    const taskKey = req.body._key;
    await Todo.findOneAndRemove({_id: taskKey});
    res.redirect('/');
});


module.exports = router;