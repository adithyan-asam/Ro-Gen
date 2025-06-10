const { getQuiz } = require('../services/quizService');
const Roadmap = require('../models/roadmap');

async function generateQuiz(req, res) {
  try {
    const { course, level, weekTopic, subtopicTitle, points } = req.body;
    const userId = req.user.id;

    if (!course || !level || !weekTopic || !subtopicTitle || !points) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const roadmap = await Roadmap.findOne({ userId, course });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const levelData = roadmap[level];
    if (!levelData) {
      return res.status(400).json({ message: 'Invalid level' });
    }

    const week = levelData.weeks.find(w => w.topic === weekTopic);
    if (!week) {
      return res.status(404).json({ message: 'Week topic not found' });
    }

    const subtopic = week.subtopics.find(s => s.subtopic === subtopicTitle);
    if (!subtopic) {
      return res.status(404).json({ message: 'Subtopic not found' });
    }

    const quiz = await getQuiz(subtopicTitle, points);

    subtopic.quiz = quiz;

    await roadmap.save();

    res.json(quiz);
  } catch (error) {
    console.error('Quiz generation failed:', error);
    res.status(500).json({ message: 'Failed to generate and save quiz' });
  }
}

module.exports = { generateQuiz };
