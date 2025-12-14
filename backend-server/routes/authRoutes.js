// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

// --- ADD THIS MISSING LINE ---
const { verifyToken } = require('../middleware/authMiddleware'); 

router.post('/register', upload.single('profileImage'), authController.register);
router.post('/login', authController.login);

// Now this line will work because verifyToken is defined
router.get('/users', verifyToken, authController.getAllUsers);

router.put('/users/:id', verifyToken, upload.single('profileImage'), authController.updateUser);
router.delete('/users/:id', verifyToken, authController.deleteUser);

module.exports = router;