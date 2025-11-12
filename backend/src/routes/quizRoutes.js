import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all quizzes (public)
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Server error fetching quizzes' });
  }
});

// Get single quiz with questions (public)
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = await Question.find({ quizId: req.params.id }).sort({ order: 1 });
    
    // For public access, don't send correct answers
    const questionsWithoutAnswers = questions.map(q => {
      const questionObj = q.toObject();
      delete questionObj.correctAnswer;
      return questionObj;
    });

    res.json({
      ...quiz.toObject(),
      questions: questionsWithoutAnswers
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Server error fetching quiz' });
  }
});

// Create quiz (admin protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Quiz title is required' });
    }

    const quiz = await Quiz.create({ title, description });
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Server error creating quiz' });
  }
});

// Update quiz (admin protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Server error updating quiz' });
  }
});

// Delete quiz (admin protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Also delete all questions associated with this quiz
    await Question.deleteMany({ quizId: req.params.id });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Server error deleting quiz' });
  }
});

export default router;

