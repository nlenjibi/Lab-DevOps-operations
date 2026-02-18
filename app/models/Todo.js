const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    task: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    category: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('todos', TodoSchema);