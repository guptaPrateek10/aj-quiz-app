'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0');
  const maxScore = parseInt(searchParams.get('maxScore') || '0');
  const correct = parseInt(searchParams.get('correct') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const percentage = parseInt(searchParams.get('percentage') || '0');

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 80) return 'Great job!';
    if (percentage >= 60) return 'Good effort!';
    if (percentage >= 40) return 'Keep practicing!';
    return 'Try again!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Quiz Results</h1>
          
          <div className="mb-8">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
              {percentage}%
            </div>
            <p className="text-xl text-gray-600 mb-4">{getScoreMessage()}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                <p className="text-2xl font-semibold text-gray-800">{correct} / {total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-2xl font-semibold text-gray-800">{score} / {maxScore}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/quiz"
              className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Quiz Selection
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading results...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

