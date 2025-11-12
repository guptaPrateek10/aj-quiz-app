"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getQuizzes, deleteQuiz, removeToken } from "@/lib/api";
import type { Quiz } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) {
      return;
    }

    try {
      await deleteQuiz(id);
      setQuizzes(quizzes.filter((q) => q._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete quiz");
    }
  };

  const handleLogout = () => {
    removeToken();
    router.push("/admin/login");
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
              Quiz Admin Dashboard
            </h1>
            <div className="flex gap-4 items-center">
              <Link
                href="/quiz"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Public Site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <Link
            href="/admin/quiz/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Create New Quiz
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              No quizzes yet. Create your first quiz!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {quiz.title}
                </h2>
                {quiz.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {quiz.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-4">
                  Created: {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/quiz/${quiz._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
