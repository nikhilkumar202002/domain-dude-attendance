// backend/controllers/workController.js
const Work = require('../models/Work');

// Create Work
exports.createWork = async (req, res) => {
    try {
        const newWork = new Work({ ...req.body, createdBy: req.user.id });
        await newWork.save();
        res.status(201).json(newWork);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get All Works
exports.getAllWorks = async (req, res) => {
    try {
        const works = await Work.find().sort({ createdAt: -1 });
        res.json(works);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Status (or any field)
exports.updateWork = async (req, res) => {
    try {
        const updatedWork = await Work.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.json(updatedWork);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Work
exports.deleteWork = async (req, res) => {
    try {
        await Work.findByIdAndDelete(req.params.id);
        res.json({ message: "Work deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};