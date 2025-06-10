const express = require('express');
const {generateQuiz} = require('../controllers/quizController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, generateQuiz);

module.exports = router;