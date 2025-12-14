const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Team Lead or CEO
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    dueDate: { type: Date },
    startTime: { type: Date }, // When staff starts
    endTime: { type: Date }    // When staff finishes
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);