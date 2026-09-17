const express = require('express');
const {
    register,
    login,
    getProfile,
    updateProfile
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Authentication API is running'
    });
});

router.post('/register', register);

router.post('/login', login);

router.get('/profile', protect, getProfile);

router.put('/profile', protect, updateProfile);

module.exports = router;
