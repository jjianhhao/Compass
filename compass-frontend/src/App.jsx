import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// === Person D's routes (teacher experience) ===
import TeacherPage from './pages/TeacherPage';
import TeacherStudentPage from './pages/TeacherStudentPage';

// === Person C fills these in (student experience) ===
// import LoginPage from './pages/LoginPage';
// import QuizPage from './pages/QuizPage';
// import DashboardPage from './pages/DashboardPage';

function PlaceholderPage({ name }) {
  return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      <div className="text-center">
        <p className="text-2xl mb-2">🚧</p>
        <p className="font-medium">{name}</p>
        <p className="text-xs mt-1">Person C's component goes here</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Person C owns this route — replace PlaceholderPage with their LoginPage */}
        <Route path="/" element={<PlaceholderPage name="Login / Student Selector" />} />
        <Route path="/quiz/:studentId" element={<PlaceholderPage name="Quiz Interface" />} />
        <Route path="/dashboard/:studentId" element={<PlaceholderPage name="Student Dashboard" />} />

        {/* Person D routes */}
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/teacher/:studentId" element={<TeacherStudentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
