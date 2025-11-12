"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getQuiz, submitQuiz } from "@/lib/api";
import type { QuizWithQuestions } from "@/lib/api";

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await getQuiz(quizId);
      setQuiz(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quiz) return;

    const unanswered = quiz.questions.filter((q) => !answers[q._id]);
    if (unanswered.length > 0) {
      if (
        !confirm(
          `You have ${unanswered.length} unanswered question(s). Submit anyway?`
        )
      ) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const submission = await submitQuiz(
        quizId,
        Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        }))
      );

      router.push(
        `/quiz/${quizId}/results?score=${submission.score}&maxScore=${submission.maxScore}&correct=${submission.correctAnswers}&total=${submission.totalQuestions}&percentage=${submission.percentage}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Quiz not found</p>
          <Link href="/quiz" className="text-blue-600 hover:text-blue-800">
            Back to Quiz Selection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <Link
              href="/quiz"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {quiz.description && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-700">{quiz.description}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <div
                key={question._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Question {index + 1}
                  </h3>
                  <p className="text-gray-700">{question.questionText}</p>
                </div>

                {question.questionType === "mcq" && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={question._id}
                          value={option}
                          checked={answers[question._id] === option}
                          onChange={(e) =>
                            handleAnswerChange(question._id, e.target.value)
                          }
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.questionType === "truefalse" && (
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={question._id}
                        value="true"
                        checked={answers[question._id] === "true"}
                        onChange={(e) =>
                          handleAnswerChange(question._id, e.target.value)
                        }
                        className="mr-3"
                      />
                      <span className="text-gray-700">True</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={question._id}
                        value="false"
                        checked={answers[question._id] === "false"}
                        onChange={(e) =>
                          handleAnswerChange(question._id, e.target.value)
                        }
                        className="mr-3"
                      />
                      <span className="text-gray-700">False</span>
                    </label>
                  </div>
                )}

                {question.questionType === "text" && (
                  <input
                    type="text"
                    value={answers[question._id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(question._id, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your answer"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
