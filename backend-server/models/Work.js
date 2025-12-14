// backend/models/Work.js
const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    companyName: { type: String, required: true },
    scope: { type: String, required: true },
    technology: { type: String }, // e.g., MERN, WordPress
    description: { type: String },
    price: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { 
        type: String, 
        enum: ['Proposal Given', 'Need to Start', 'Ongoing', 'Completed'], 
        default: 'Proposal Given' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Work', workSchema);