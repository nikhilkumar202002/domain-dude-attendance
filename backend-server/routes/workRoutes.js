// backend/routes/workRoutes.js
const express = require('express');
const router = express.Router();
const workController = require('../controllers/workController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken); // Protect all routes

router.post('/', workController.createWork);
router.get('/', workController.getAllWorks);
router.put('/:id', workController.updateWork); // For status updates
router.delete('/:id', workController.deleteWork);

module.exports = router;