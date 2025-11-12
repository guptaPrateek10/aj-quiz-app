import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';

const router = express.Router();

// Submit quiz answers (public)
router.post('/:quizId/submit', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, answer }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get all questions for this quiz
    const questions = await Question.find({ quizId }).sort({ order: 1 });
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({ error: 'Quiz has no questions' });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalScore = 0;
    let maxScore = 0;

    const answerMap = new Map();
    answers.forEach(a => {
      answerMap.set(a.questionId.toString(), a.answer);
    });

    questions.forEach(question => {
      maxScore += question.points;
      const userAnswer = answerMap.get(question._id.toString());
      
      if (userAnswer !== undefined) {
        // Normalize answers for comparison (trim and lowercase for text questions)
        let isCorrect = false;
        
        if (question.questionType === 'text') {
          // For text questions, do case-insensitive comparison
          isCorrect = question.correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
        } else {
          // For MCQ and True/False, exact match
          isCorrect = question.correctAnswer === userAnswer;
        }

        if (isCorrect) {
          correctAnswers++;
          totalScore += question.points;
        }
      }
    });

    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Save quiz attempt
    const quizAttempt = await QuizAttempt.create({
      quizId,
      answers: answers.map(a => ({
        questionId: a.questionId,
        answer: a.answer
      })),
      score: totalScore,
      percentage,
      correctAnswers,
      totalQuestions
    });

    res.json({
      quizAttemptId: quizAttempt._id,
      score: totalScore,
      maxScore,
      correctAnswers,
      totalQuestions,
      percentage
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Server error submitting quiz' });
  }
});

export default router;

