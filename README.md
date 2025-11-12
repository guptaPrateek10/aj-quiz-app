# Quiz App - Full Stack Application

A full-stack quiz application built with Next.js (frontend) and Node.js/Express (backend), featuring an admin panel for quiz management and a public interface for taking quizzes.

## Features

- **Admin Panel**: Create, edit, and delete quizzes with dynamic question builder
- **Question Types**: Support for MCQ, True/False, and Text answer questions
- **Public Quiz Interface**: Users can select and take quizzes
- **Results Display**: Shows score percentage, correct answers count, and total questions
- **Authentication**: JWT-based admin authentication

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000` and automatically create an admin user with:
- Username: `admin`
- Password: `123456`

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### Admin Access
1. Navigate to `/admin/login`
2. Login with:
   - Username: `admin`
   - Password: `123456`
3. Create quizzes and add questions from the dashboard

### Public Access
1. Navigate to `/quiz` (or the home page redirects here)
2. Select a quiz to take
3. Answer questions and submit
4. View results with score and percentage

## Project Structure

```
quiz-app/
├── src/                    # Next.js frontend
│   └── app/
│       ├── admin/         # Admin panel routes
│       ├── quiz/          # Public quiz routes
│       └── lib/           # API utilities
├── backend/                # Node.js/Express backend
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   └── config/        # DB config
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Quizzes
- `GET /api/quizzes` - Get all quizzes (public)
- `GET /api/quizzes/:id` - Get quiz with questions (public)
- `POST /api/quizzes` - Create quiz (admin)
- `PUT /api/quizzes/:id` - Update quiz (admin)
- `DELETE /api/quizzes/:id` - Delete quiz (admin)

### Questions
- `GET /api/quizzes/:quizId/questions` - Get questions for quiz (admin)
- `POST /api/quizzes/:quizId/questions` - Add question (admin)
- `PUT /api/quizzes/questions/:id` - Update question (admin)
- `DELETE /api/quizzes/questions/:id` - Delete question (admin)

### Submissions
- `POST /api/quizzes/:quizId/submit` - Submit quiz answers (public)

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses node --watch for auto-reload
```

### Frontend Development
```bash
npm run dev  # Next.js dev server with Turbo
```

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
npm run build
npm start
```

## Notes

- The admin user is automatically seeded on backend startup
- JWT tokens are stored in localStorage
- Quiz answers are case-insensitive for text questions
- MCQ questions require at least 2 options
- All admin routes are protected with JWT authentication
