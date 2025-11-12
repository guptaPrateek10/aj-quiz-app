import express from 'express';
import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add question to quiz (admin protected)
router.post('/:quizId/questions', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, questionType, options, correctAnswer, points, order } = req.body;

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Validate required fields
    if (!questionText || !questionType || !correctAnswer) {
      return res.status(400).json({ error: 'Question text, type, and correct answer are required' });
    }

    // Validate question type
    if (!['mcq', 'truefalse', 'text'].includes(questionType)) {
      return res.status(400).json({ error: 'Invalid question type. Must be mcq, truefalse, or text' });
    }

    // For MCQ, options are required
    if (questionType === 'mcq' && (!options || options.length < 2)) {
      return res.status(400).json({ error: 'MCQ questions require at least 2 options' });
    }

    const question = await Question.create({
      quizId,
      questionText,
      questionType,
      options: options || [],
      correctAnswer,
      points: points || 1,
      order: order || 0
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Server error creating question' });
  }
});

// Update question (admin protected)
router.put('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { questionText, questionType, options, correctAnswer, points, order } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Validate question type if provided
    if (questionType && !['mcq', 'truefalse', 'text'].includes(questionType)) {
      return res.status(400).json({ error: 'Invalid question type. Must be mcq, truefalse, or text' });
    }

    // For MCQ, validate options
    const finalQuestionType = questionType || question.questionType;
    if (finalQuestionType === 'mcq' && options && options.length < 2) {
      return res.status(400).json({ error: 'MCQ questions require at least 2 options' });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        questionText: questionText || question.questionText,
        questionType: finalQuestionType,
        options: options !== undefined ? options : question.options,
        correctAnswer: correctAnswer || question.correctAnswer,
        points: points !== undefined ? points : question.points,
        order: order !== undefined ? order : question.order
      },
      { new: true, runValidators: true }
    );

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Server error updating question' });
  }
});

// Delete question (admin protected)
router.delete('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Server error deleting question' });
  }
});

// Get all questions for a quiz (admin only, includes correct answers)
router.get('/:quizId/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId }).sort({ order: 1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Server error fetching questions' });
  }
});

export default router;

