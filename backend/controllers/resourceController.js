const {generateResources} = require('../services/generateResources');
const Roadmap = require('../models/roadmap');

async function generateLearningResources(req,res){
    try {
      const { course, level, weekTopic, subtopicTitle, points, time } = req.body;
      const userId = req.user.id;

      if (!course || !level || !weekTopic || !subtopicTitle || !points) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const roadmap = await Roadmap.findOne({ userId, course, totalTime: time });
      if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }

      const levelData = roadmap[level];
      if (!levelData) {
        return res.status(400).json({ message: "Invalid level" });
      }

      const week = levelData.weeks.find((w) => w.topic === weekTopic);
      if (!week) {
        return res.status(404).json({ message: "Week topic not found" });
      }

      const subtopic = week.subtopics.find((s) => s.subtopic === subtopicTitle);
      if (!subtopic) {
        return res.status(404).json({ message: "Subtopic not found" });
      }

      if(subtopic.resources && subtopic.resources.length > 0){
        return res.json(subtopic.resources);
      }

      const resources = await generateResources(subtopicTitle, points);

      subtopic.resources = resources.resources;
      await roadmap.save();
      res.json(resources.resources);
    } catch (error) {
      console.error("failed to generate resources : ", error);
      res.status(500).json({ message: "failed to generate resources" });
    }
}

module.exports = {generateLearningResources};