// backend/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all routes (User must be logged in)
router.use(verifyToken);

// POST /api/attendance -> Mark "Present"
router.post('/', attendanceController.markAttendance);

// GET /api/attendance -> View History
router.get('/', attendanceController.getAttendance);

module.exports = router;