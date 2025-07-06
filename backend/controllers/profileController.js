const User = require('../models/user');
const Roadmap = require('../models/roadmap');

async function getProfileData(req,res){
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('name email createdAt');
        const roadmaps = await Roadmap.find({userId});

        const courses = roadmaps.map(roadmap => {
            const {course, totalTime, beginner, intermediate, advanced} = roadmap;
            const levels = { beginner, intermediate, advanced };
            let completedWeeks = 0;
            const weekScores = [];

            for(const [levelName, levelData] of Object.entries(levels)){
                if (!levelData || !Array.isArray(levelData.weeks)) continue;

                levelData.weeks.forEach((week,index) => {
                    const isCompleted = week.isCompleted === true;
                    if(isCompleted){
                        completedWeeks++;
                    }
                    weekScores.push({
                      level: levelName,
                      week: index + 1,
                      topic: week.topic,
                      avgScore: (() => {
                        if (week.isCompleted) {
                          return week.averageScore ?? "-";
                        } else {
                          return week.averageScore !== null
                            ? week.averageScore
                            : "-";
                        }
                      })()
                    });
                });
            }
            return {
              course,
              totalTime,
              completedWeeks,
              weekScores,
            };
        });

        res.status(200).json({
          user,
          courses,
        });
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {getProfileData};