const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const {protect} = require('../middleware/authMiddleware');
const User = require('../models/user');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, async (req, res) => {
    try {
        // Fetch fresh user data from database
        const user = await User.findById(req.user._id)
            .select('-password -__v -createdAt -updatedAt')
            .lean();

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Transform to match your API response format
        res.json({
            success: true,
            user: {
                id: user._id,  // Convert _id to id for consistency
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

module.exports = router;
