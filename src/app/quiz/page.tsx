'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizzes } from '@/lib/api';
import type { Quiz } from '@/lib/api';

export default function QuizSelectionPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg text-gray-600">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Quiz App</h1>
            <Link
              href="/admin/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Select a Quiz</h2>
          <p className="text-lg text-gray-600">Choose a quiz to test your knowledge</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-2xl mx-auto">
            <p className="text-gray-500 text-lg">No quizzes available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Link
                key={quiz._id}
                href={`/quiz/${quiz._id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                )}
                <div className="flex items-center text-blue-600 font-medium">
                  Start Quiz
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

