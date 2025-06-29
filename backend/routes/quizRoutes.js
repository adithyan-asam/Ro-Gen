const express = require('express');
const {generateQuiz,saveScore,checkScore,getLockIndices} = require('../controllers/quizController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, generateQuiz);
router.post('/submit-score', protect, saveScore);
router.post('/check-score', protect, checkScore);
router.get('/lock-indexes', protect, getLockIndices);

module.exports = router;