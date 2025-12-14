const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

console.log("Task Controller:", taskController); 
console.log("Create Task Function:", taskController.createTask);
console.log("Verify Token:", verifyToken);

// Route: Create Task (Only CEO and Team Lead)
router.post('/', verifyToken, authorizeRoles('CEO', 'Team Lead'), taskController.createTask);
// Route: Get Tasks (Logic inside controller handles who sees what)
router.get('/', verifyToken, taskController.getTasks);

// Route: Update Task (Staff updating their work)
router.put('/update', verifyToken, authorizeRoles('Staff'), taskController.updateTaskStatus);

module.exports = router;