const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {getProfileData} = require('../controllers/profileController');

const router = express.Router();

router.get('/', protect, getProfileData);

module.exports = router;