const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  type: String
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: { type: Number, required: true },
  reason: { type: String }
}, { _id: false });

const ResourceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  source: {type: String, required: true}, 
  covers: [{ type: String, required: true }],
  recommendedFor: { type: String, required: true }
}, { _id: false });

const SubtopicSchema = new mongoose.Schema({
  subtopic: { type: String, required: true },
  time: { type: String, required: true },
  points: [PointSchema],
  quiz: {
    questions: [QuestionSchema],
    score: { type: Number, default: null }
  },
  resources: [ResourceSchema]
}, { _id: false });

const WeekSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  subtopics: [SubtopicSchema],
  averageScore: { type: Number, default: null },
  isCompleted: { type: Boolean, default: false }
}, { _id: false });

const LevelSchema = new mongoose.Schema({
  weeks: [WeekSchema],
  lockIndex: { type: Number, default: 0 }
}, { _id: false });

const RoadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  totalTime: { type: String, required: true },
  beginner: LevelSchema,
  intermediate: LevelSchema,
  advanced: LevelSchema
}, { timestamps: true });

const Roadmap = mongoose.model('Roadmap', RoadmapSchema);
module.exports = Roadmap;   
