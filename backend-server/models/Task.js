// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    
    // New Field
    subCategory: { type: String }, 

    subtasks: [
        {
            title: { type: String, required: true },
            isCompleted: { type: Boolean, default: false }
        }
    ],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    
    // Updated Status Options
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Work Started', 'Completed', 'Correction'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);