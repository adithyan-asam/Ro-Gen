const express = require('express');
const {generateRoadmap,deleteRoadmap} = require('../controllers/roadmapController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, generateRoadmap);
router.post('/delete', protect, deleteRoadmap);

module.exports = router;