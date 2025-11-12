const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  quizId: string;
  questionText: string;
  questionType: "mcq" | "truefalse" | "text";
  options: string[];
  correctAnswer?: string; // Only available for admin
  points: number;
  order: number;
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

export interface QuizSubmission {
  quizAttemptId: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

// Get auth token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Set auth token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// Remove auth token from localStorage
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
    mode: "cors",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

// Auth API
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

// Quiz API
export const getQuizzes = async (): Promise<Quiz[]> => {
  return apiRequest<Quiz[]>("/api/quizzes");
};

export const getQuiz = async (id: string): Promise<QuizWithQuestions> => {
  return apiRequest<QuizWithQuestions>(`/api/quizzes/${id}`);
};

export const createQuiz = async (
  title: string,
  description?: string
): Promise<Quiz> => {
  return apiRequest<Quiz>("/api/quizzes", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
};

export const updateQuiz = async (
  id: string,
  title: string,
  description?: string
): Promise<Quiz> => {
  return apiRequest<Quiz>(`/api/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, description }),
  });
};

export const deleteQuiz = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/quizzes/${id}`, {
    method: "DELETE",
  });
};

// Question API
export const getQuestions = async (quizId: string): Promise<Question[]> => {
  return apiRequest<Question[]>(`/api/quizzes/${quizId}/questions`);
};

export const createQuestion = async (
  quizId: string,
  question: Omit<Question, "_id" | "quizId" | "createdAt" | "updatedAt">
): Promise<Question> => {
  return apiRequest<Question>(`/api/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify(question),
  });
};

export const updateQuestion = async (
  id: string,
  question: Partial<
    Omit<Question, "_id" | "quizId" | "createdAt" | "updatedAt">
  >
): Promise<Question> => {
  return apiRequest<Question>(`/api/quizzes/questions/${id}`, {
    method: "PUT",
    body: JSON.stringify(question),
  });
};

export const deleteQuestion = async (id: string): Promise<void> => {
  return apiRequest<void>(`/api/quizzes/questions/${id}`, {
    method: "DELETE",
  });
};

// Submission API
export const submitQuiz = async (
  quizId: string,
  answers: Array<{ questionId: string; answer: string }>
): Promise<QuizSubmission> => {
  return apiRequest<QuizSubmission>(`/api/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
};
