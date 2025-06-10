const express = require('express');
const {generateLearningResources} = require('../controllers/resourceController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, generateLearningResources);

module.exports = router;