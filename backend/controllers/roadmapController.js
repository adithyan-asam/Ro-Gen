const { createRoadmap } = require('../services/roadmapService');
const Roadmap = require('../models/roadmap');

async function generateRoadmap(req, res) {
    try {
        const { course, time } = req.body;
        const userId = req.user.id;

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
                    }))
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

module.exports = { generateRoadmap };
