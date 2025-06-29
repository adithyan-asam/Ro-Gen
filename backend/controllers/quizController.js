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

async function saveScore(req,res){
  try{
    const { course, level, weekIndex, subtopicIndex, score,time } = req.body;
    const userId = req.user.id;
    if(!course || !level || weekIndex === undefined || subtopicIndex === undefined || score === undefined){
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const path = `${level}.weeks.${weekIndex}.subtopics.${subtopicIndex}.quiz.score`;
    const result = await Roadmap.updateOne(
      {userId,course, totalTime: time},
      { $set: { [path]: score } }
    );
    if(result.modifiedCount > 0){
      return res.status(200).json({message : 'score saved succesfully'});
    }
    else{
      return res.status(404).json({ message: 'Roadmap or quiz not found.' });
    }
  }catch (error) {
    console.error('Quiz score saving failed:', error);
    res.status(500).json({ message: 'Failed to save quiz score.' });
  }
}

async function checkScore(req,res){
  try{
    const {course, level, weekIndex, time} = req.body;
    const userId = req.user.id;
    if (!course || !level || weekIndex === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const roadmap = await Roadmap.findOne({userId,course,totalTime: time});
    if (!roadmap || !roadmap[level]) {
      return res.status(404).json({ message: 'Roadmap or level not found' });
    }
    const week = roadmap[level].weeks[weekIndex];
    if (!week) {
      return res.status(404).json({ message: 'Week not found' });
    }

    const subtopics = week.subtopics;
    let totalScore = 0;
    let quizCount = 0;
    let inComplete = false;
    for(const sub of subtopics){
      if(!sub.quiz || typeof sub.quiz.score!=='number'){
        inComplete = true;
        break;
      }
      else{
        totalScore += sub.quiz.score;
        quizCount++;
      }
    }

    if(inComplete){
      return res.status(200).json({
        allowed: false,
        average: 0,
        message: 'Please complete all quizzes in this week before proceeding.'
      });
    }

    const average = totalScore/quizCount;
    const lockIndex = roadmap[level].lockIndex;
    if (average >= 50 && (lockIndex===(weekIndex+1))) {
      const path = `${level}.lockIndex`;
      const result = await Roadmap.updateOne(
        { userId, course, totalTime: time },
        { $inc: { [path]: 1 } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Roadmap not updated." });
      }
    }

    return res.status(200).json({
      allowed: average >= 50,
      average,
      message: average >= 50 ? '✅ Next week unlocked!' : '❌ Score below 50%. Try again.'
    });
  }
  catch(err){
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
