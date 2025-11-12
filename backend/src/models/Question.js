import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['mcq', 'truefalse', 'text']
  },
  options: {
    type: [String],
    default: []
  },
  correctAnswer: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;

