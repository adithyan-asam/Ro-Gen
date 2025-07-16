const { getQuiz } = require('../services/quizService');
const Roadmap = require('../models/roadmap');

async function generateQuiz(req, res) {
  try {
    const { course, level, weekTopic, subtopicTitle, points,time } = req.body;
    const userId = req.user.id;

    if (!course || !level || !weekTopic || !subtopicTitle || !points) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const roadmap = await Roadmap.findOne({ userId, course,totalTime: time });
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

    if (subtopic.quiz && subtopic.quiz.questions && subtopic.quiz.questions.length > 0) {
      return res.json(subtopic.quiz);
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

async function saveScore(req, res) {
  try {
    const { course, level, weekIndex, subtopicIndex, score, time } = req.body;
    const userId = req.user.id; 

    if (!course || !level || weekIndex === undefined || subtopicIndex === undefined || score === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 1. Save quiz score
    const path = `${level}.weeks.${weekIndex}.subtopics.${subtopicIndex}.quiz.score`;
    await Roadmap.updateOne(
      { userId, course, totalTime: time },
      { $set: { [path]: score } }
    );

    // 2. Load roadmap
    const roadmap = await Roadmap.findOne({ userId, course, totalTime: time });
    if (!roadmap || !roadmap[level]) {
      return res.status(404).json({ message: 'Roadmap or level not found' });
    }

    const week = roadmap[level].weeks[weekIndex];
    const subtopics = week?.subtopics || [];

    // 3. Check if all quizzes attempted
    const allAttempted = subtopics.every(sub => sub.quiz && typeof sub.quiz.score === 'number');

    if (!allAttempted) {
      return res.status(200).json({
        completed: false,
        message: 'Score saved. Week not fully attempted yet.'
      });
    }

    // 4. Calculate average
    const total = subtopics.reduce((sum, sub) => sum + sub.quiz.score, 0);
    const avgScore = Math.round(total / subtopics.length);
    const isCompleted = avgScore >= 50;

    // 5. Update averageScore and isCompleted
    const weekPath = `${level}.weeks.${weekIndex}`;
    const setFields = {
      [`${weekPath}.averageScore`]: avgScore,
    };

    if (!week.isCompleted) {
      setFields[`${weekPath}.isCompleted`] = isCompleted;
    }

    await Roadmap.updateOne(
      { userId, course, totalTime: time },
      { $set: setFields }
    );


    let unlocked = false;

    // 6. Unlock next week if not already unlocked
    const currentLockIndex = roadmap[level].lockIndex;
    if (isCompleted && currentLockIndex === weekIndex + 1) {
      const incPath = `${level}.lockIndex`;
      await Roadmap.updateOne(
        { userId, course, totalTime: time },
        { $inc: { [incPath]: 1 } }
      );
      unlocked = true;

      // Also unlock next level if last week of this level
      const len = roadmap[level].weeks.length;
      if (weekIndex === len - 1) {
        const nextLevel = level === 'beginner' ? 'intermediate' : level === 'intermediate' ? 'advanced' : null;
        if (nextLevel) {
          const nextPath = `${nextLevel}.lockIndex`;
          await Roadmap.updateOne(
            { userId, course, totalTime: time },
            { $inc: { [nextPath]: 1 } }
          );
        }
      }
    }

    return res.status(200).json({
      completed: isCompleted,
      unlocked,
      averageScore: avgScore,
      message: unlocked ? '✅ Next week unlocked!' : '✅ Week completed, but already unlocked earlier.'
    });

  } catch (error) {
    console.error('Quiz score saving failed:', error);
    res.status(500).json({ message: 'Failed to save quiz score.' });
  }
}


async function checkScore(req, res) {
  try {
    const { course, level, weekIndex, time } = req.body;
    const userId = req.user.id;

    if (!course || !level || weekIndex === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const roadmap = await Roadmap.findOne({ userId, course, totalTime: time });
    if (!roadmap || !roadmap[level]) {
      return res.status(404).json({ message: 'Roadmap or level not found' });
    }

    const week = roadmap[level].weeks[weekIndex];
    const lockIndex = roadmap[level].lockIndex;
    if (!week) {
      return res.status(404).json({ message: 'Week not found.' });
    }

    // CASE 1: Not completed, missing quizzes
    if (week.averageScore === null && !week.isCompleted) {
      return res.status(200).json({
        allowed: false,
        average: 0,
        message: '❌ Please complete all quizzes in this week before proceeding.'
      });
    }

    // Case 2: Completed but already unlocked
    if (week.isCompleted && lockIndex > weekIndex + 1) {
      return res.status(200).json({
        allowed: true,
        average: week.averageScore,
        message: '' // No need to show unlock alert again
      });
    }

    // Case 3: Completed and exactly at unlock point → Show unlock message
    if (week.isCompleted && lockIndex === weekIndex + 1) {
      return res.status(200).json({
        allowed: true,
        average: week.averageScore,
        message: '✅ Next week unlocked!'
      });
    }

    if(week.isCompleted && week.averageScore < 50){
      return res.status(200).json({
        allowed: true,
        average: week.averageScore,
        message: ''
      });
    }

    // CASE 3: All attempted but score < 50%
    return res.status(200).json({
      allowed: false,
      average: week.averageScore,
      message: '❌ Score below 50%. Try again.'
    });

  } catch (err) {
    console.error('Error checking week score:', err);
    res.status(500).json({ message: 'Server error while checking score.' });
  }
}


async function getLockIndices(req,res){
  try {
    const { course, time } = req.query;
    const userId = req.user.id;

    if (!course) {
      return res.status(400).json({ message: "Course is required" });
    }
    const roadmap = await Roadmap.findOne({ userId, course,totalTime: time });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    const lockIndexes = {
      beginner: roadmap.beginner?.lockIndex ?? -1,
      intermediate: roadmap.intermediate?.lockIndex ?? -1,
      advanced: roadmap.advanced?.lockIndex ?? -1,
    };
    res.json({ lockIndexes });
  } catch (err) {
    console.error("Failed to fetch lock indexes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { generateQuiz,saveScore,checkScore,getLockIndices };
