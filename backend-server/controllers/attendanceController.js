// backend/controllers/attendanceController.js
const Attendance = require('../models/Attendance');

// --- Mark Attendance (Check In) ---
exports.markAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get start and end of "Today" to prevent double marking
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Check if user already marked attendance today
        const existingLog = await Attendance.findOne({
            userId: userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingLog) {
            return res.status(400).json({ message: "You have already marked attendance today." });
        }

        // Create new record
        const newLog = new Attendance({
            userId,
            status: req.body.status || 'Present',
            date: new Date()
        });

        await newLog.save();
        res.status(201).json(newLog);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Get Attendance Logs ---
exports.getAttendance = async (req, res) => {
    try {
        let logs;

        // If CEO or Team Lead -> See ALL records
        if (req.user.role === 'CEO' || req.user.role === 'Team Lead') {
            logs = await Attendance.find()
                .populate('userId', 'username role') // Show staff name and role
                .sort({ date: -1 }); // Newest first
        } 
        // If Staff -> See ONLY their own records
        else {
            logs = await Attendance.find({ userId: req.user.id })
                .sort({ date: -1 });
        }

        res.json(logs);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};