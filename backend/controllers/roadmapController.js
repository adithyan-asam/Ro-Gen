const { createRoadmap } = require('../services/roadmapService');
const Roadmap = require('../models/roadmap');

async function generateRoadmap(req, res) {
    try {
        const { course, time } = req.body;
        const userId = req.user.id;

        const existing = await Roadmap.findOne({userId, course, totalTime: time});
        if (existing) {
          const result = {};
          let counter = 1;
          ["beginner", "intermediate", "advanced"].forEach((level) => {
            if (existing[level]) {
              result[level] = {};
              existing[level].weeks.forEach((week, index) => {
                const weekKey = `week ${counter}`;
                result[level][weekKey] = {
                  topic: week.topic,
                  subtopics: week.subtopics.map((subtopic) => ({
                    subtopic: subtopic.subtopic,
                    time: subtopic.time,
                    points: subtopic.points.map((point) => point.type),
                  })),
                };
                counter++;
              });
            }
          });
          return res.json(result);
        }

        // Generate roadmap from AI
        const generatedRoadmap = await createRoadmap(course, time);

        // Prepare full roadmap document
        const roadmapData = {
            userId,
            course,
            totalTime: time,
        };

        for (const level of ['beginner', 'intermediate', 'advanced']) {
            if (generatedRoadmap[level]) {
                roadmapData[level] = {
                    weeks: Object.entries(generatedRoadmap[level]).map(([_, weekData]) => ({
                        topic: weekData.topic,
                        subtopics: weekData.subtopics.map(subtopic => ({
                            subtopic: subtopic.subtopic,
                            time: subtopic.time,
                            points: subtopic.points.map(point => ({ type: point })),
                            quiz: { questions: [] },
                            resources: []
                        }))
                    })),
                    lockIndex: level==='beginner' ? 1 : 0
                };
            }
        }

        await Roadmap.create(roadmapData);
        res.json(generatedRoadmap);
    } catch (error) {
        console.error('Roadmap generation failed:', error);
        res.status(500).json({ message: 'Failed to generate roadmap', error: error.message });
    }
}

async function deleteRoadmap(req,res){
  try {
    const {course,time} = req.body;
    const userId = req.user.id;
    const result = await Roadmap.deleteOne({userId,course,totalTime: time});
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No matching document found." });
    }

    res.json({ message: "Resource deleted successfully." });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

module.exports = { generateRoadmap,deleteRoadmap };
