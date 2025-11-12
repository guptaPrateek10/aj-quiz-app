"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getQuiz,
  updateQuiz,
  createQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestions,
} from "@/lib/api";
import type { Quiz, Question } from "@/lib/api";

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const isNew = quizId === "new";

  const [quiz, setQuiz] = useState<Partial<Quiz>>({
    title: "",
    description: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNew) {
      loadQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, isNew]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizData = await getQuiz(quizId);
      setQuiz({ title: quizData.title, description: quizData.description });

      const questionsData = await getQuestions(quizId);
      setQuestions(questionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quiz.title?.trim()) {
      setError("Quiz title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isNew && quiz.title) {
        const newQuiz = await createQuiz(quiz.title, quiz.description);
        router.push(`/admin/quiz/${newQuiz._id}`);
      } else {
        await updateQuiz(quizId, quiz.title, quiz.description);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        _id: `temp-${Date.now()}`,
        quizId: quizId,
        questionText: "",
        questionType: "mcq",
        options: ["", ""],
        correctAnswer: "",
        points: 1,
        order: questions.length,
      } as Question,
    ]);
  };

  const handleUpdateQuestion = (
    index: number,
    field: keyof Question,
    value: string | number | string[]
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = [...updated[questionIndex].options, ""];
    setQuestions(updated);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(updated);
  };

  const handleUpdateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSaveQuestion = async (question: Question, index: number) => {
    try {
      if (!question?.questionText.trim()) {
        alert("Question text is required");
        return;
      }

      if (!question.correctAnswer || !question.correctAnswer.trim()) {
        alert("Correct answer is required");
        return;
      }

      if (question.questionType === "mcq" && question.options.length < 2) {
        alert("MCQ questions require at least 2 options");
        return;
      }

      if (isNew || question._id.startsWith("temp-")) {
        const newQuestion = await createQuestion(quizId, {
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points,
          order: index,
        });
        const updated = [...questions];
        updated[index] = newQuestion;
        setQuestions(updated);
      } else {
        const updatedQuestion = await updateQuestion(question._id, {
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points,
          order: index,
        });
        const updated = [...questions];
        updated[index] = updatedQuestion;
        setQuestions(updated);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save question");
    }
  };

  const handleDeleteQuestion = async (questionId: string, index: number) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      if (!questionId.startsWith("temp-")) {
        await deleteQuestion(questionId);
      }
      setQuestions(questions.filter((_, i) => i !== index));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete question");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {isNew ? "Create Quiz" : "Edit Quiz"}
            </h1>
            <Link
              href="/admin/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Quiz Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={quiz.title || ""}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={quiz.description || ""}
                onChange={(e) =>
                  setQuiz({ ...quiz, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter quiz description"
              />
            </div>

            <button
              onClick={handleSaveQuiz}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Quiz Info"}
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            {!isNew && (
              <button
                onClick={handleAddQuestion}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Question
              </button>
            )}
          </div>

          {isNew && (
            <p className="text-gray-500 mb-4">
              Save the quiz first to add questions.
            </p>
          )}

          {questions.length === 0 && !isNew && (
            <p className="text-gray-500 text-center py-8">
              No questions yet. Add your first question!
            </p>
          )}

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-700">
                    Question {index + 1}
                  </h3>
                  <button
                    onClick={() => handleDeleteQuestion(question._id, index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) =>
                        handleUpdateQuestion(
                          index,
                          "questionText",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Enter question text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={question.questionType}
                      onChange={(e) => {
                        const newType = e.target.value as
                          | "mcq"
                          | "truefalse"
                          | "text";
                        handleUpdateQuestion(index, "questionType", newType);
                        if (newType === "mcq" && question.options.length < 2) {
                          handleUpdateQuestion(index, "options", ["", ""]);
                        } else if (newType !== "mcq") {
                          handleUpdateQuestion(index, "options", []);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="truefalse">True/False</option>
                      <option value="text">Text Answer</option>
                    </select>
                  </div>

                  {question.questionType === "mcq" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options *
                      </label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2 mb-2">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctAnswer === option}
                            onChange={() =>
                              handleUpdateQuestion(
                                index,
                                "correctAnswer",
                                option
                              )
                            }
                            className="mt-1"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleUpdateOption(
                                index,
                                optIndex,
                                e.target.value
                              )
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() =>
                                handleRemoveOption(index, optIndex)
                              }
                              className="text-red-600 hover:text-red-800 px-2"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddOption(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  {question.questionType === "truefalse" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`tf-${index}`}
                            value="true"
                            checked={question.correctAnswer === "true"}
                            onChange={(e) =>
                              handleUpdateQuestion(
                                index,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            className="mr-2"
                          />
                          True
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`tf-${index}`}
                            value="false"
                            checked={question.correctAnswer === "false"}
                            onChange={(e) =>
                              handleUpdateQuestion(
                                index,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            className="mr-2"
                          />
                          False
                        </label>
                      </div>
                    </div>
                  )}

                  {question.questionType === "text" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correct Answer *
                      </label>
                      <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) =>
                          handleUpdateQuestion(
                            index,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter correct answer"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        handleUpdateQuestion(
                          index,
                          "points",
                          parseInt(e.target.value) || 1
                        )
                      }
                      min="1"
                      className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={() => handleSaveQuestion(question, index)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save Question
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
