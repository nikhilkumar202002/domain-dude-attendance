const Task = require('../models/Task');

// CREATE TASK: Only CEO & Team Lead
exports.createTask = async (req, res) => {
    try {
        const { title, assignedTo, dueDate } = req.body;
        const newTask = new Task({
            title,
            assignedTo, // The Staff ID
            assignedBy: req.user.id, // ID from the logged-in Team Lead/CEO
            dueDate
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET TASKS: Different logic based on Role
exports.getTasks = async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'CEO') {
            tasks = await Task.find().populate('assignedTo', 'username'); // CEO sees all
        } else if (req.user.role === 'Team Lead') {
            tasks = await Task.find({ assignedBy: req.user.id }).populate('assignedTo', 'username'); // TL sees what they assigned
        } else {
            tasks = await Task.find({ assignedTo: req.user.id }); // Staff sees only their own
        }
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE TASK: Staff updates status/time
exports.updateTaskStatus = async (req, res) => {
    try {
        const { taskId, status, startTime, endTime } = req.body;
        // Ensure Staff can only update their own tasks
        const task = await Task.findOne({ _id: taskId, assignedTo: req.user.id });
        
        if (!task) return res.status(404).json({ error: "Task not found or not assigned to you" });

        if (status) task.status = status;
        if (startTime) task.startTime = startTime;
        if (endTime) task.endTime = endTime;

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};