const Task = require('../models/Task');
const User = require('../models/User');
// CREATE TASK: Only CEO & Team Lead
exports.createTask = async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();

        // --- NOTIFICATION LOGIC ---
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        
        // Find if the assigned staff is online
        const staffSocketId = onlineUsers.get(req.body.assignedTo);
        
        if (staffSocketId) {
            io.to(staffSocketId).emit('notification', {
                message: `New Task Assigned: ${req.body.title}`,
                type: 'info',
                timestamp: new Date()
            });
        }
        // ---------------------------

        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // --- NOTIFICATION LOGIC ---
        if (req.body.status === 'Completed') {
            const io = req.app.get('io');
            const onlineUsers = req.app.get('onlineUsers');

            // Find all CEOs and Team Leads
            const admins = await User.find({ role: { $in: ['CEO', 'Team Lead'] } });

            admins.forEach(admin => {
                const adminSocketId = onlineUsers.get(admin._id.toString());
                if (adminSocketId) {
                    io.to(adminSocketId).emit('notification', {
                        message: `Task Completed: "${updatedTask.title}"`,
                        type: 'success',
                        timestamp: new Date()
                    });
                }
            });
        }
        // ---------------------------

        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET TASKS: Different logic based on Role
exports.getTasks = async (req, res) => {
    try {
        let tasks;

        // 1. CEO & Team Lead: View ALL tasks
        if (req.user.role === 'CEO' || req.user.role === 'Team Lead') {
            tasks = await Task.find()
                .populate('assignedTo', 'username')
                .sort({ createdAt: -1 }); // Newest first
        } 
        // 2. Staff: View ONLY tasks assigned TO them
        else {
            tasks = await Task.find({ assignedTo: req.user.id })
                .populate('assignedTo', 'username')
                .sort({ createdAt: -1 });
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