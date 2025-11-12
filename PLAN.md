# Quiz App - Full Stack Implementation Plan

## Project Structure

```
quiz-app/
├── src/                    # Next.js frontend (existing)
│   └── app/
│       ├── admin/         # Admin panel routes
│       ├── quiz/          # Public quiz routes
│       └── api/           # Next.js API routes (optional, or use separate backend)
├── backend/                # Node.js/Express backend (new)
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   ├── config/        # DB config
│   │   └── server.js      # Express server entry
│   └── package.json
└── PLAN.MD                 # This plan document
```

## Backend Implementation

### 1. Backend Setup (`backend/`)

- Initialize Node.js project with Express
- Install dependencies: `express`, `mongoose`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`
- Create Express server with CORS enabled for frontend communication
- Set up MongoDB connection using Mongoose
- Create environment configuration for DB connection string

### 2. Database Schema Design (`backend/src/models/`)

**User Model** (`User.js`):

- `username`: String (unique, required) - static admin user
- `password`: String (required) - hashed password
- `role`: String (default: 'admin')

**Quiz Model** (`Quiz.js`):

- `title`: String (required)
- `description`: String (optional)
- `createdAt`: Date (default: now)
- `updatedAt`: Date

**Question Model** (`Question.js`):

- `quizId`: ObjectId (ref: Quiz, required)
- `questionText`: String (required)
- `questionType`: Enum ['mcq', 'truefalse', 'text'] (required)
- `options`: Array of Strings (required for MCQ)
- `correctAnswer`: String (required) - stores correct answer
- `points`: Number (default: 1)
- `order`: Number (for question ordering)

**QuizAttempt Model** (`QuizAttempt.js`):

- `quizId`: ObjectId (ref: Quiz, required)
- `answers`: Array of Objects { questionId, answer }
- `score`: Number (calculated)
- `percentage`: Number (calculated)
- `correctAnswers`: Number (calculated)
- `totalQuestions`: Number
- `submittedAt`: Date (default: now)

### 3. API Routes (`backend/src/routes/`)

**Auth Routes** (`authRoutes.js`):

- `POST /api/auth/login` - Admin login (username: admin, password: 123456)
- Returns JWT token on success

**Quiz Routes** (`quizRoutes.js`):

- `GET /api/quizzes` - Get all quizzes (public)
- `GET /api/quizzes/:id` - Get quiz with questions (public)
- `POST /api/quizzes` - Create quiz (admin protected)
- `PUT /api/quizzes/:id` - Update quiz (admin protected)
- `DELETE /api/quizzes/:id` - Delete quiz (admin protected)

**Question Routes** (`questionRoutes.js`):

- `POST /api/quizzes/:quizId/questions` - Add question to quiz (admin protected)
- `PUT /api/questions/:id` - Update question (admin protected)
- `DELETE /api/questions/:id` - Delete question (admin protected)

**Submission Routes** (`submissionRoutes.js`):

- `POST /api/quizzes/:quizId/submit` - Submit quiz answers (public)
- Returns score, percentage, correct answers count

### 4. Middleware (`backend/src/middleware/`)

- `authMiddleware.js` - JWT token verification for protected routes
- Apply to admin routes (quiz creation, question management)

### 5. Initial Data Setup

- Seed admin user with username: "admin" and password: "123456" (hashed)
- Create script or auto-seed on server start if user doesn't exist

## Frontend Implementation

### 1. Admin Panel (`src/app/admin/`)

**Login Page** (`admin/login/page.tsx`):

- Form with username and password fields
- Submit to `/api/auth/login`
- Store JWT token in localStorage/sessionStorage
- Redirect to admin dashboard on success

**Dashboard** (`admin/dashboard/page.tsx`):

- List all quizzes with edit/delete options
- "Create New Quiz" button
- Protected route (check for auth token)

**Create/Edit Quiz** (`admin/quiz/[id]/page.tsx` or `admin/quiz/new/page.tsx`):

- Form for quiz title
- Dynamic question builder:
  - Add/remove questions
  - For each question:
    - Question text input
    - Question type selector (MCQ, True/False, Text)
    - For MCQ: Options array with add/remove, mark correct answer
    - For True/False: Radio buttons for correct answer
    - For Text: Text input for correct answer
- Save button to POST/PUT to backend API

### 2. Public Quiz Interface (`src/app/quiz/`)

**Quiz Selection** (`quiz/page.tsx`):

- Fetch all quizzes from `/api/quizzes`
- Display as cards/list with quiz titles
- Click to start quiz

**Take Quiz** (`quiz/[id]/page.tsx`):

- Fetch quiz with questions from `/api/quizzes/:id`
- Render questions based on type:
  - MCQ: Radio buttons or checkboxes for options
  - True/False: Radio buttons (True/False)
  - Text: Text input field
- Submit button at bottom
- On submit: POST answers to `/api/quizzes/:id/submit`
- Show results page with score, percentage, correct answers

**Results Page** (`quiz/[id]/results/page.tsx` or modal):

- Display score percentage
- Show number of correct answers / total questions
- Option to retake or go back to quiz selection

### 3. API Integration

- Create API utility functions (`src/lib/api.ts` or `src/utils/api.ts`):
  - Base API URL configuration
  - Functions for each API endpoint
  - Handle authentication headers (JWT token)
  - Error handling

### 4. State Management

- Use React hooks (useState, useEffect) for local state
- Consider context API for auth state if needed
- Or use simple localStorage for token persistence

### 5. UI Components

- Reusable components in `src/components/`:
  - `Button`, `Input`, `Card`, `Modal`
  - `QuestionForm` (for admin)
  - `QuestionDisplay` (for public quiz)
- Use Tailwind CSS for styling (already configured)

## Technical Decisions

1. **Authentication**: JWT tokens stored in localStorage
2. **API Communication**: Fetch API or axios for HTTP requests
3. **Form Handling**: React controlled components
4. **Validation**: Client-side validation + backend validation
5. **Error Handling**: Try-catch blocks with user-friendly error messages
6. **Routing**: Next.js App Router (already in use)

## Environment Variables

**Backend** (`.env`):

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `PORT` - Backend server port (default: 5000)

**Frontend** (`.env.local`):

- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., http://localhost:5000)

## Implementation Order

1. Set up backend structure and MongoDB connection
2. Create Mongoose schemas
3. Implement authentication (login endpoint)
4. Create quiz and question CRUD APIs
5. Implement quiz submission and scoring logic
6. Build admin login page
7. Build admin dashboard and quiz creation form
8. Build public quiz selection page
9. Build quiz taking interface
10. Build results display
11. Add error handling and validation
12. Style with Tailwind CSS

## Testing Considerations

- Test API endpoints with Postman/Thunder Client
- Test admin authentication flow
- Test quiz creation with different question types
- Test quiz submission and scoring accuracy
- Test responsive design on different screen sizes
